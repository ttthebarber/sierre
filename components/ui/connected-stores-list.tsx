import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, RefreshCw, Trash2 } from "lucide-react";

interface ConnectedStore {
  id: string;
  name: string;
  platform: string;
  connected_at: string;
}

interface ConnectedStoresListProps {
  stores: ConnectedStore[];
  onSync?: (storeId: string) => void;
  onDisconnect?: (storeId: string) => void;
}

export function ConnectedStoresList({ stores, onSync, onDisconnect }: ConnectedStoresListProps) {
  if (!stores || stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Connected Stores</h4>
        <p className="text-sm text-gray-600 mb-3">
          {stores.length} store{stores.length !== 1 ? 's' : ''} connected to your account
        </p>
      </div>
      
      <div className="space-y-2">
        {stores.map((store) => (
          <div key={store.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center">
                  <img src="/shopify_glyph.svg" alt="Shopify" className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">{store.name}</h5>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Connected {new Date(store.connected_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                
                <div className="flex gap-1">
                  {onSync && (
                    <Button
                      onClick={() => onSync(store.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      title="Sync store"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                  {onDisconnect && (
                    <Button
                      onClick={() => onDisconnect(store.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Disconnect store"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}