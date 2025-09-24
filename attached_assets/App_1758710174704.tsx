import { Button } from "./components/ui/button";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { Card, CardContent } from "./components/ui/card";
import { MoreHorizontal, Share, Check, Info, Star, Crown, Users, Shield, Zap, Clock } from "lucide-react";
import { useState } from "react";

export default function App() {
  const [selectedMonths, setSelectedMonths] = useState("6");
  const [selectedType, setSelectedType] = useState("6people");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const monthOptions = [
    { value: "1", label: "1 month", discount: null },
    { value: "3", label: "3 months", discount: "10%" },
    { value: "6", label: "6 months", discount: "20%" }
  ];

  const typeOptions = [
    { 
      value: "6people", 
      label: "1 Slot (Shared with 6 people)", 
      price: 68.77,
      popular: true,
      features: ["Shared workspace", "6 team members", "Basic support"]
    },
    { 
      value: "solo", 
      label: "GPT Solo (Private)", 
      price: 149.99,
      popular: false,
      features: ["Private workspace", "Unlimited usage", "Premium support", "Advanced features"]
    }
  ];

  const currentPrice = typeOptions.find(opt => opt.value === selectedType)?.price || 68.77;
  const monthlyPrice = (currentPrice / parseInt(selectedMonths)).toFixed(2);

  const features = [
    { icon: <Crown className="w-4 h-4" />, text: "ChatGPT Plus Access" },
    { icon: <Zap className="w-4 h-4" />, text: "Faster Response Times" },
    { icon: <Shield className="w-4 h-4" />, text: "Priority Access" },
    { icon: <Users className="w-4 h-4" />, text: "Multi-Platform Support" },
    { icon: <Clock className="w-4 h-4" />, text: "24/7 Availability" }
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* RTL Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRTL(!isRTL)}
          className="bg-white shadow-lg"
        >
          {isRTL ? "LTR" : "RTL"}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Product Card */}
          <div className="lg:col-span-3 order-1">
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-8 relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    Premium
                  </Badge>
                </div>
                <div className="text-center mt-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">ChatGPT</h2>
                  <p className="text-lg opacity-90">(Plus)</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current text-yellow-300" />
                    ))}
                    <span className="text-sm ml-2 opacity-80">4.9</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 order-2">
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">ChatGPT Plus</h1>
                    <p className="text-gray-600 mt-1">Advanced AI assistant with premium features</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors px-3 py-2 rounded-lg"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="hidden sm:inline">More options</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        2
                      </Badge>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors px-3 py-2 rounded-lg"
                    >
                      <Share className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        7
                      </Badge>
                    </Button>
                  </div>
                </div>

                {/* Purchase Duration */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Purchase Duration
                  </h3>
                  <RadioGroup 
                    value={selectedMonths} 
                    onValueChange={setSelectedMonths}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {monthOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label 
                          htmlFor={option.value}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                            selectedMonths === option.value 
                              ? 'border-teal-500 bg-teal-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.discount && (
                            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                              Save {option.discount}
                            </Badge>
                          )}
                          <div className="text-center">
                            <div className={`font-semibold ${selectedMonths === option.value ? 'text-teal-700' : 'text-gray-900'}`}>
                              {option.label}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Select Type */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Select Plan Type
                  </h3>
                  <RadioGroup 
                    value={selectedType} 
                    onValueChange={setSelectedType}
                    className="space-y-4"
                  >
                    {typeOptions.map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label 
                          htmlFor={option.value}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                            selectedType === option.value 
                              ? 'border-teal-500 bg-teal-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.popular && (
                            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white">
                              Most Popular
                            </Badge>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-4 h-4 rounded-full mt-1 border-2 ${
                                selectedType === option.value 
                                  ? 'bg-teal-500 border-teal-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedType === option.value && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                                )}
                              </div>
                              <div>
                                <div className={`font-semibold ${selectedType === option.value ? 'text-teal-700' : 'text-gray-900'}`}>
                                  {option.label}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {option.features.join(" • ")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${selectedType === option.value ? 'text-teal-700' : 'text-gray-900'}`}>
                                ${option.price}
                              </div>
                              <div className="text-xs text-gray-500">
                                ${(option.price / parseInt(selectedMonths)).toFixed(2)}/mo
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>





                {/* Description */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">About ChatGPT Plus</h3>
                  <p className="text-gray-600 leading-relaxed">
                    ChatGPT Plus is a premium AI assistant powered by OpenAI's latest GPT-4 model. 
                    Experience faster response times, priority access during peak hours, and access to 
                    new features as they're released. Perfect for professionals, students, and anyone 
                    who wants to maximize their productivity with AI assistance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 order-3">
            <div className="sticky top-8">
              <Card className="shadow-xl border-0">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Pricing */}
                    <div>
                      <h3 className="font-semibold mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">${currentPrice}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-semibold text-green-600">-$10.00</span>
                        </div>

                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <div className="text-right">
                            <div className="text-teal-600 font-semibold text-xl">
                              ${(currentPrice - 10).toFixed(2)}
                            </div>
                            <div className="text-teal-600 text-sm">
                              ${((currentPrice - 10) / parseInt(selectedMonths)).toFixed(2)}/mo
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>



                    {/* CTA Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      JOIN NOW
                    </Button>


                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}