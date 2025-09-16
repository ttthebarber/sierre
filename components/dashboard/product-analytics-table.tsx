"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, ChevronUp, ChevronDown, GripVertical, MoreVertical } from "lucide-react";

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

interface ProductData {
  id: string;
  name: string;
  category: string;
  status: string;
  orders: number;
  revenue: number;
  conversionRate: number;
  storeLocation: string;
}

interface ProductAnalyticsTableProps {
  stores: Array<{id: string; name: string; platform: string; metrics: any; summary: any}>;
}

export function ProductAnalyticsTable({ stores }: ProductAnalyticsTableProps) {
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // TODO: Replace with real product data from Shopify API
  // For now, showing empty state when no stores are connected
  const productData: ProductData[] = [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(item => item.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return productData;
    
    return [...productData].sort((a, b) => {
      const aVal = a[sortField as keyof ProductData];
      const bVal = b[sortField as keyof ProductData];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  }, [productData, sortField, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (stores.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Product Analytics</CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            Connect your store to see product performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No product data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Product Analytics</CardTitle>
        <CardDescription className="text-gray-500 text-sm">
          Product performance and analytics from your Shopify store
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
              <TableHead className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Header</span>
                </div>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Product Name
                  <SortIcon field="name" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Status
                  <SortIcon field="status" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('orders')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Orders
                  <SortIcon field="orders" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('revenue')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Revenue
                  <SortIcon field="revenue" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('conversionRate')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Conversion Rate
                  <SortIcon field="conversionRate" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <button 
                  onClick={() => handleSort('storeLocation')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Store Location
                  <SortIcon field="storeLocation" />
                </button>
              </TableHead>
              <TableHead className="px-4 py-3">
                <span className="text-sm font-medium text-gray-900">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedRows.has(product.id)}
                      onCheckedChange={() => handleSelectRow(product.id)}
                    />
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-900">{product.orders}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-900">{fmtCurrency(product.revenue)}</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-900">{product.conversionRate}%</TableCell>
                <TableCell className="px-4 py-3 text-sm text-gray-900">{product.storeLocation}</TableCell>
                <TableCell className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedRows.size} of {sortedData.length} row(s) selected.
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ««
                  </button>
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                  <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »»
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
