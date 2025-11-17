import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as topojson from 'topojson-client';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ValidationResult {
  totalGeoJsonIds: number;
  totalSheetEntries: number;
  unmappedInSheet: string[];
  allGeoJsonIds: string[];
  sheetVnbNames: string[];
}

export default function AdminVnbMapping() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const extractGeoJsonIds = async (): Promise<string[]> => {
    const response = await fetch('/data/vnb_regions.json');
    const topoData = await response.json();
    const geoJsonData = topojson.feature(topoData, topoData.objects.data) as any;
    
    return geoJsonData.features
      .map((f: any) => f.id)
      .filter((id: string) => id)
      .sort();
  };

  const fetchSheetData = async (): Promise<string[]> => {
    // Fetch zvNE sheet
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1-LLeZNX-TUYPkI2EBJaWltwHHTJpVnyPWU7_SfiWk9U/export?format=csv&gid=1065017362';
    const response = await fetch(sheetUrl);
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    const vnbNames: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const fields = parseCSVLine(line);
      const vnbName = fields[1]?.trim(); // Column B is VNB name
      if (vnbName) {
        vnbNames.push(vnbName);
      }
    }
    
    return vnbNames;
  };

  const parseCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField);
    return fields;
  };

  const validateMapping = async () => {
    setLoading(true);
    try {
      const [geoJsonIds, sheetVnbNames] = await Promise.all([
        extractGeoJsonIds(),
        fetchSheetData()
      ]);

      // Load current mapping
      const mappingResponse = await fetch('/data/vnb_id_reference.csv');
      const mappingText = await mappingResponse.text();
      const mappingLines = mappingText.trim().split('\n');
      
      const mappedNames = new Set<string>();
      for (let i = 1; i < mappingLines.length; i++) {
        const parts = mappingLines[i].split(',');
        if (parts[0]) mappedNames.add(parts[0].trim());
      }

      const unmapped = sheetVnbNames.filter(name => !mappedNames.has(name));

      setValidationResult({
        totalGeoJsonIds: geoJsonIds.length,
        totalSheetEntries: sheetVnbNames.length,
        unmappedInSheet: unmapped,
        allGeoJsonIds: geoJsonIds,
        sheetVnbNames
      });
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCompleteReference = () => {
    if (!validationResult) return;

    let csv = 'VNB_Name,GeoJSON_ID,Status\n';
    
    // Add all sheet entries
    validationResult.sheetVnbNames.forEach(name => {
      const isMapped = !validationResult.unmappedInSheet.includes(name);
      csv += `${name},,${isMapped ? 'Needs_ID' : 'UNMAPPED'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnb_mapping_complete_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllGeoJsonIds = () => {
    if (!validationResult) return;

    let csv = 'GeoJSON_ID,VNB_Name,Notes\n';
    validationResult.allGeoJsonIds.forEach(id => {
      csv += `${id},,Please fill in VNB name\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_geojson_ids_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    validateMapping();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">VNB Mapping Validation</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg">Analyzing mapping data...</p>
          </div>
        ) : validationResult ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-muted-foreground">GeoJSON Polygons</p>
                    <p className="text-2xl font-bold">{validationResult.totalGeoJsonIds}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-blue-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sheet Entries</p>
                    <p className="text-2xl font-bold">{validationResult.totalSheetEntries}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-500 w-8 h-8" />
                  <div>
                    <p className="text-sm text-muted-foreground">Unmapped in Sheet</p>
                    <p className="text-2xl font-bold">{validationResult.unmappedInSheet.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Download Options</h2>
              <div className="flex gap-4">
                <Button onClick={downloadAllGeoJsonIds}>
                  <Download className="mr-2 w-4 h-4" />
                  Download All {validationResult.totalGeoJsonIds} GeoJSON IDs
                </Button>
                <Button onClick={downloadCompleteReference} variant="outline">
                  <Download className="mr-2 w-4 h-4" />
                  Download Sheet VNB List ({validationResult.totalSheetEntries} entries)
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Download these files to create your mapping. Match VNB names from your sheet to the GeoJSON IDs.
              </p>
            </Card>

            {validationResult.unmappedInSheet.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Unmapped VNBs ({validationResult.unmappedInSheet.length})</h2>
                <div className="max-h-96 overflow-y-auto">
                  <ul className="space-y-1">
                    {validationResult.unmappedInSheet.slice(0, 50).map((name, idx) => (
                      <li key={idx} className="text-sm font-mono">{name}</li>
                    ))}
                    {validationResult.unmappedInSheet.length > 50 && (
                      <li className="text-sm text-muted-foreground">
                        ... and {validationResult.unmappedInSheet.length - 50} more
                      </li>
                    )}
                  </ul>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-blue-50 dark:bg-blue-950">
              <h3 className="font-bold mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Download "All GeoJSON IDs" CSV - this contains all {validationResult.totalGeoJsonIds} polygon IDs</li>
                <li>Open your Google Sheet with {validationResult.totalSheetEntries} entries</li>
                <li>Match each VNB name in your sheet to a GeoJSON ID from the downloaded file</li>
                <li>Replace Column A (VNB-ID) in your sheet with the matching GeoJSON IDs</li>
                <li>Some VNBs may share the same polygon ID if they cover the same region</li>
              </ol>
            </Card>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
