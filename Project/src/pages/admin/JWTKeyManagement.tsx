import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertTitle, AlertDescription } from "../../components/ui";
import { RefreshCw, Key, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { checkJwtKeyRotation, rotateJwtKey, getJwtKeyEvents, addJwtKey, JwtKeyInfo, JwtKeyEvent } from '../../lib/jwtKeyManager';
import { toast } from 'react-hot-toast';

const JWTKeyManagement: React.FC = () => {
  const [keys, setKeys] = useState<JwtKeyInfo[]>([]);
  const [events, setEvents] = useState<JwtKeyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rotating, setRotating] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('keys');
  const [addingKey, setAddingKey] = useState<boolean>(false);
  const [newKeyId, setNewKeyId] = useState<string>('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('HS256');
  const [keyPrefix, setKeyPrefix] = useState<string>(`key-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`);

  // Load key data and events
  const loadData = async () => {
    setLoading(true);
    try {
      const [keysData, eventsData] = await Promise.all([
        checkJwtKeyRotation(),
        getJwtKeyEvents(50)
      ]);
      
      setKeys(keysData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load JWT key data:', err);
      toast.error('Failed to load key data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle key rotation
  const handleRotateKey = async (keyId: string) => {
    setRotating(true);
    try {
      await rotateJwtKey(keyId);
      toast.success(`Key ${keyId} rotated successfully`);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to rotate key:', err);
      toast.error('Failed to rotate key');
    } finally {
      setRotating(false);
    }
  };

  // Handle adding a new key
  const handleAddKey = async () => {
    if (!keyPrefix.trim()) {
      toast.error('Key prefix is required');
      return;
    }

    const uniqueId = `${keyPrefix}-${Math.floor(Math.random() * 10000)}`;
    setAddingKey(true);
    try {
      await addJwtKey(uniqueId, selectedAlgorithm, '30 days', false);
      toast.success(`Added new key: ${uniqueId}`);
      setKeyPrefix(`key-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`);
      setNewKeyId('');
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to add key:', err);
      toast.error('Failed to add key');
    } finally {
      setAddingKey(false);
    }
  };

  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">JWT Key Management</h1>
          <Button 
            variant="outline" 
            onClick={loadData} 
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>Security Best Practices</AlertTitle>
          <AlertDescription>
            JWT keys should be rotated regularly to enhance security. 
            Any key rotation will automatically handle token updates for users.
          </AlertDescription>
        </Alert>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="keys">
              <Key className="mr-2 h-4 w-4" />
              Active Keys
            </TabsTrigger>
            <TabsTrigger value="events">
              <Shield className="mr-2 h-4 w-4" />
              Key Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active JWT Keys</h2>
              
              {keys.length === 0 ? (
                <p className="text-gray-500">No JWT keys found</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Key ID</th>
                      <th>Status</th>
                      <th>Next Rotation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key.keyId}>
                        <td className="font-mono">{key.keyId}</td>
                        <td>
                          {key.needsRotation ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="mr-1 h-4 w-4" />
                              Needs Rotation
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50">
                              <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td>
                          {key.needsRotation ? (
                            <span className="text-red-500">Overdue</span>
                          ) : (
                            <span>
                              {key.daysUntilRotation} days
                            </span>
                          )}
                        </td>
                        <td>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRotateKey(key.keyId)}
                            disabled={rotating}
                          >
                            {rotating ? 'Rotating...' : 'Rotate Key'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New JWT Key</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="keyPrefix">
                    Key Prefix
                  </label>
                  <input
                    id="keyPrefix"
                    className="w-full p-2 border rounded"
                    type="text"
                    value={keyPrefix}
                    onChange={(e) => setKeyPrefix(e.target.value)}
                    disabled={addingKey}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A unique identifier will be appended to this prefix
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="algorithm">
                    Signing Algorithm
                  </label>
                  <select
                    id="algorithm"
                    className="w-full p-2 border rounded"
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    disabled={addingKey}
                  >
                    <option value="HS256">HS256 (Default)</option>
                    <option value="HS384">HS384</option>
                    <option value="HS512">HS512</option>
                  </select>
                </div>
              </div>
              <Button 
                onClick={handleAddKey} 
                disabled={addingKey || !keyPrefix.trim()}
              >
                {addingKey ? 'Adding Key...' : 'Add New Key'}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">JWT Key Events</h2>
              
              {events.length === 0 ? (
                <p className="text-gray-500">No key events found</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Key ID</th>
                      <th>Timestamp</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <Badge 
                            variant={event.eventType === 'rotated' ? 'default' : 
                                   event.eventType === 'created' ? 'outline' :
                                   'secondary'}
                          >
                            {event.eventType}
                          </Badge>
                        </td>
                        <td className="font-mono text-xs">{event.keyId}</td>
                        <td>{formatDate(event.createdAt)}</td>
                        <td>{event.performedBy || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default JWTKeyManagement;
