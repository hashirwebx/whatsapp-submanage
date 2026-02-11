import { useState } from 'react';
import { CreditCard, Building2, DollarSign, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'paypal' | 'bank';
  lastFourDigits?: string;
  email?: string;
  accountNumber?: string;
  label?: string;
  isDefault?: boolean;
}

interface PaymentMethodInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethodInput({ value, onChange }: PaymentMethodInputProps) {
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      lastFourDigits: '4242',
      label: 'Personal Visa',
      isDefault: true,
    },
  ]);

  // Get card brand icon
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return (
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
            <div className="flex -space-x-1">
              <div className="w-3 h-3 bg-red-600 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full opacity-80"></div>
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
            <DollarSign size={20} className="text-white" />
          </div>
        );
      case 'bank':
        return (
          <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
        );
      default:
        return <CreditCard size={20} />;
    }
  };


  const handleDeleteMethod = (id: string) => {
    setSavedMethods(savedMethods.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const handleSetDefault = (id: string) => {
    setSavedMethods(savedMethods.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
    const method = savedMethods.find(m => m.id === id);
    if (method) {
      onChange(getMethodDisplayText(method));
    }
    toast.success('Default payment method updated');
  };

  const getMethodDisplayText = (method: PaymentMethod): string => {
    switch (method.type) {
      case 'visa':
        return `Visa ****${method.lastFourDigits}`;
      case 'mastercard':
        return `MasterCard ****${method.lastFourDigits}`;
      case 'paypal':
        return `PayPal (${method.email})`;
      case 'bank':
        return `Bank Transfer ****${method.accountNumber?.slice(-4)}`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>Payment Method</Label>

      {/* Saved Payment Methods */}
      <div className="space-y-2">
        {savedMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center justify-between p-3 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${method.isDefault ? 'border-[#225E56] bg-[#225E56]/5' : 'border-gray-200'
              }`}
            onClick={() => handleSetDefault(method.id)}
          >
            <div className="flex items-center gap-3">
              {getCardIcon(method.type)}
              <div>
                <div className="font-medium text-sm flex items-center gap-2">
                  {method.label}
                  {method.isDefault && (
                    <Badge variant="outline" className="text-xs bg-[#225E56] text-white border-[#225E56]">
                      <Check size={10} className="mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {getMethodDisplayText(method)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMethod(method.id);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>


    </div>
  );
}
