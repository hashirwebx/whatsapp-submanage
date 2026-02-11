import { useState, useEffect } from 'react';
import { X, Plus, Edit, Calendar as CalendarIcon, DollarSign, CreditCard, Building2, Globe, FileText, Clock, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { PaymentMethodInput } from './PaymentMethodInput';
import { toast } from 'sonner@2.0.3';
import { useSubscriptions, Subscription } from '../contexts/SubscriptionContext';

interface AddSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  subscriptionToEdit?: Subscription | null;
}

// Currency options
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

// Billing cycle options
const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

// Bank options (mock data - in real app, fetch from user's settings)
const BANKS = [
  { value: 'none', label: 'None (No bank selected)' },
  { value: 'hbl', label: 'Habib Bank Limited (HBL)' },
  { value: 'ubl', label: 'United Bank Limited (UBL)' },
  { value: 'mcb', label: 'Muslim Commercial Bank (MCB)' },
  { value: 'allied', label: 'Allied Bank' },
  { value: 'meezan', label: 'Meezan Bank' },
  { value: 'other', label: 'Other' },
];

// Service categories
const CATEGORIES = [
  'Entertainment',
  'Music',
  'Software',
  'AI Tools',
  'Development',
  'Storage',
  'Productivity',
  'Education',
  'Fitness',
  'News',
  'Gaming',
  'Other',
];

export function AddSubscription({ isOpen, onClose, onSuccess, subscriptionToEdit }: AddSubscriptionProps) {
  const { addNewSubscription, updateExistingSubscription } = useSubscriptions();

  const isEditing = !!subscriptionToEdit;

  // Form state - Service Details
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Entertainment');

  // Form state - Pricing & Billing
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Form state - Schedule & Organization
  const [startDate, setStartDate] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  // Form state - Bank Information
  const [selectedBank, setSelectedBank] = useState('none');

  // Form state - Payment Method
  const [paymentMethod, setPaymentMethod] = useState('');

  // Form state - Reminder Settings
  const [daysBeforePayment, setDaysBeforePayment] = useState('3');
  const [reminderTime, setReminderTime] = useState('09:00');

  // Form state - Additional Information
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effect to populate form when editing
  useEffect(() => {
    if (subscriptionToEdit && isOpen) {
      setServiceName(subscriptionToEdit.name || '');
      setCategory(subscriptionToEdit.category || 'Other');
      setCost(subscriptionToEdit.amount?.toString() || '');
      setCurrency(subscriptionToEdit.currency || 'USD');
      setBillingCycle(subscriptionToEdit.billingCycle || 'monthly');

      // Handle dates
      if (subscriptionToEdit.nextBilling) {
        setNextPaymentDate(subscriptionToEdit.nextBilling.split('T')[0]);
      } else {
        setNextPaymentDate('');
      }

      // Other fields
      setPaymentMethod(subscriptionToEdit.paymentMethod || '');
      setStartDate(subscriptionToEdit.startDate ? subscriptionToEdit.startDate.split('T')[0] : '');
      setSelectedBank(subscriptionToEdit.bank || 'none');
      setDaysBeforePayment(subscriptionToEdit.reminderSettings?.daysBeforePayment?.toString() || '3');
      setReminderTime(subscriptionToEdit.reminderSettings?.reminderTime || '09:00');
      setDescription(subscriptionToEdit.description || '');
      setWebsiteUrl(subscriptionToEdit.websiteUrl || subscriptionToEdit.website || '');
    } else if (!isOpen) {
      // Clear form when closed? or handled by resetForm on success
    } else {
      resetForm();
    }
  }, [subscriptionToEdit, isOpen]);

  // Format date for input (DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD)
  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;

    // Try DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try MM/DD/YYYY format
    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD format (already correct)
    const yyyymmdd = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
    if (yyyymmdd) {
      return dateStr;
    }

    return null;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required: Service Name
    if (!serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    // Required: Cost (must be >= 0.01)
    const costNum = parseFloat(cost);
    if (!cost || isNaN(costNum) || costNum < 0.01) {
      newErrors.cost = 'Cost must be at least 0.01';
    }

    // Required: Next Payment Date
    if (!nextPaymentDate) {
      newErrors.nextPaymentDate = 'Next payment date is required';
    } else {
      const parsedDate = parseDate(nextPaymentDate);
      if (!parsedDate) {
        newErrors.nextPaymentDate = 'Invalid date format (use DD/MM/YYYY or MM/DD/YYYY)';
      }
    }

    // Optional: Start Date (validate format if provided)
    if (startDate) {
      const parsedDate = parseDate(startDate);
      if (!parsedDate) {
        newErrors.startDate = 'Invalid date format (use DD/MM/YYYY or MM/DD/YYYY)';
      }
    }

    // Optional: Website URL (auto-add https:// if not present)
    if (websiteUrl && !websiteUrl.match(/^https?:\/\//)) {
      setWebsiteUrl(`https://${websiteUrl}`);
    }

    // Optional: Days Before Payment (must be positive integer)
    const daysNum = parseInt(daysBeforePayment);
    if (daysBeforePayment && (isNaN(daysNum) || daysNum < 0)) {
      newErrors.daysBeforePayment = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      const subscriptionData = {
        // Service Details
        name: serviceName.trim(),
        category,

        // Pricing & Billing
        amount: parseFloat(cost),
        currency,
        billingCycle,

        // Schedule
        startDate: startDate ? parseDate(startDate) : null,
        nextBilling: parseDate(nextPaymentDate),

        // Bank & Payment
        bank: selectedBank !== 'none' ? selectedBank : null,
        paymentMethod: paymentMethod || 'Not specified',

        // Reminder Settings
        reminderSettings: {
          daysBeforePayment: parseInt(daysBeforePayment) || 3,
          reminderTime: reminderTime || '09:00',
        },

        // Additional Information
        websiteUrl: websiteUrl || null,
        description: description.trim() || null,

        // Metadata
        status: isEditing && subscriptionToEdit ? subscriptionToEdit.status : 'active',
        logo: getCategoryEmoji(category),
        createdAt: isEditing && subscriptionToEdit ? subscriptionToEdit.createdAt : new Date().toISOString(),
        originalCurrency: isEditing && subscriptionToEdit ? subscriptionToEdit.originalCurrency : currency,
      };

      const success = isEditing && subscriptionToEdit
        ? await updateExistingSubscription(subscriptionToEdit.id, subscriptionData)
        : await addNewSubscription(subscriptionData);

      if (success) {
        toast.success(isEditing ? 'Subscription updated successfully!' : 'Subscription added successfully!', {
          description: isEditing
            ? `${serviceName} has been updated.`
            : `${serviceName} has been added to your subscriptions.`,
        });

        // Reset form
        resetForm();

        // Close dialog
        onClose();

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error(isEditing ? 'Failed to update subscription' : 'Failed to add subscription', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setServiceName('');
    setCategory('Entertainment');
    setCost('');
    setCurrency('USD');
    setBillingCycle('monthly');
    setStartDate('');
    setNextPaymentDate('');
    setSelectedBank('none');
    setPaymentMethod('');
    setDaysBeforePayment('3');
    setReminderTime('09:00');
    setWebsiteUrl('');
    setDescription('');
    setErrors({});
  };

  // Get emoji for category
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      Entertainment: '🎬',
      Music: '🎵',
      Software: '💻',
      'AI Tools': '🤖',
      Development: '⚡',
      Storage: '☁️',
      Productivity: '📝',
      Education: '📚',
      Fitness: '💪',
      News: '📰',
      Gaming: '🎮',
      Other: '📱',
    };
    return emojiMap[category] || '📱';
  };

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEditing ? 'Edit Subscription' : 'Add New Subscription'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the details for ${subscriptionToEdit?.name}.`
              : 'Fill in the details for your new subscription. Required fields are marked with an asterisk (*).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={20} className="text-[#225E56]" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Name */}
              <div>
                <Label htmlFor="serviceName">
                  Service Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className={errors.serviceName ? 'border-red-500' : ''}
                />
                {errors.serviceName && (
                  <p className="text-xs text-red-500 mt-1">{errors.serviceName}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryEmoji(cat)} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing & Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign size={20} className="text-[#225E56]" />
                Pricing & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cost */}
                <div>
                  <Label htmlFor="cost">
                    Cost <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className={errors.cost ? 'border-red-500' : ''}
                  />
                  {errors.cost && (
                    <p className="text-xs text-red-500 mt-1">{errors.cost}</p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <Label htmlFor="currency">
                    Currency <span className="text-red-500">*</span>
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name} ({curr.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <Label htmlFor="billingCycle">
                  Billing Cycle / Frequency <span className="text-red-500">*</span>
                </Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger id="billingCycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLES.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Schedule & Organization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon size={20} className="text-[#225E56]" />
                Schedule & Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    When did or will this subscription start?
                  </p>
                </div>

                {/* Next Payment Date */}
                <div>
                  <Label htmlFor="nextPaymentDate">
                    Next Payment Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nextPaymentDate"
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className={errors.nextPaymentDate ? 'border-red-500' : ''}
                  />
                  {errors.nextPaymentDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.nextPaymentDate}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    The upcoming payment due date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Bank & Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard size={20} className="text-[#225E56]" />
                Bank & Payment Information
              </CardTitle>
              <CardDescription>Optional: Select bank and payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bank Selection */}
              <div>
                <Label htmlFor="bank">Associated Bank (Optional)</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.value} value={bank.value}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
                <PaymentMethodInput
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select or add your payment method (e.g., Visa ****4242)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell size={20} className="text-[#225E56]" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure when you want to be reminded via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Days Before Payment */}
                <div>
                  <Label htmlFor="daysBeforePayment">Days Before Payment</Label>
                  <Input
                    id="daysBeforePayment"
                    type="number"
                    min="0"
                    max="30"
                    value={daysBeforePayment}
                    onChange={(e) => setDaysBeforePayment(e.target.value)}
                    className={errors.daysBeforePayment ? 'border-red-500' : ''}
                  />
                  {errors.daysBeforePayment && (
                    <p className="text-xs text-red-500 mt-1">{errors.daysBeforePayment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Default: 3 days</p>
                </div>

                {/* Reminder Time */}
                <div>
                  <Label htmlFor="reminderTime">Reminder Time (Pakistan Time)</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 09:00 AM (PKT)</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> WhatsApp number is set in Settings → Notifications.
                  Only one number will be used for all subscription reminders.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe size={20} className="text-[#225E56]" />
                Additional Information
              </CardTitle>
              <CardDescription>Optional details about this subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Website URL */}
              <div>
                <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to the service's website (https:// will be auto-added)
                </p>
              </div>

              {/* Description & Notes */}
              <div>
                <Label htmlFor="description">Description & Notes (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details like shared account, renewal terms, special features, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Any additional information you want to remember
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#225E56] hover:bg-[#1a4a44] text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {isEditing ? <Edit size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                  {isEditing ? 'Update Subscription' : 'Add Subscription'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
