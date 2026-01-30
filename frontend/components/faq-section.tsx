"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ArrowRight, HelpCircle, MessageCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "How do I add my business to BizDirectory?",
    answer:
      'Click on "Add Your Business" button and fill out the simple form with your business details. It\'s completely free to list your business on our platform.',
  },
  {
    question: "Is it free to list my business?",
    answer:
      "Yes, basic business listings are completely free. We also offer premium features for businesses that want enhanced visibility and additional marketing tools.",
  },
  {
    question: "How can customers find my business?",
    answer:
      "Customers can find your business through our search functionality, by browsing categories, or by exploring businesses in their city. We optimize listings for maximum visibility.",
  },
  {
    question: "Can I edit my business information after listing?",
    answer:
      "Yes, you can update your business information at any time. Contact our support team for assistance with updates.",
  },
  {
    question: "What information should I include in my business listing?",
    answer:
      "Include your business name, category, complete address, phone number, email, business hours, and a detailed description of your services. High-quality photos also help attract customers.",
  },
  {
    question: "How do I contact businesses listed on BizDirectory?",
    answer:
      "Each business listing includes contact information such as phone numbers, email addresses, and WhatsApp numbers where available. You can reach out directly through your preferred method.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-4xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-5">
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Got Questions?</span>
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 md:mb-5">
            Frequently Asked <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Find answers to common questions about using BizDirectory business directory platform.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-8 sm:mb-10">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 px-4 sm:px-6 py-2"
              >
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-gray-900 hover:text-primary transition-colors py-3 sm:py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-gray-600 leading-relaxed pb-3 sm:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4">
            <p className="text-sm sm:text-base text-gray-600 font-medium">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/add">
                <Button 
                  size="lg" 
                  className="custom-button-style px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base font-semibold"
                >
                  <span>List Your Business</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-6 sm:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base font-semibold border-2 hover:bg-primary/5 hover:border-primary transition-all"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span>Contact Support</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
