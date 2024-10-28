"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Search,
  BookOpen,
  Video,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como adicionar um novo produto ao sistema?",
    answer:
      "Para adicionar um novo produto, acesse a página de Produtos através do menu lateral, clique no botão 'Add Product' no canto superior direito. Preencha todos os campos obrigatórios no formulário e clique em 'Create Product'.",
  },
  {
    question: "Como rastrear um produto na cadeia de suprimentos?",
    answer:
      "Na página 'Cadeia de Suprimentos', utilize o campo de busca para encontrar o produto pelo SKU ou nome. Clique no produto para ver seu histórico completo de movimentações e status atual.",
  },
  {
    question: "Como gerar relatórios personalizados?",
    answer:
      "Acesse a seção 'Relatórios' no menu lateral. Selecione o tipo de relatório desejado, configure os filtros necessários e clique em 'Gerar Relatório'. Você pode salvar os relatórios em diferentes formatos.",
  },
];

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSupportMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle support message submission
    setMessage("");
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Central de Ajuda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar na documentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Tabs defaultValue="faq" className="space-y-4">
            <TabsList>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Documentação
              </TabsTrigger>
              <TabsTrigger
                value="tutorials"
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Tutoriais
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Suporte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Introdução ao Sistema
                        </h3>
                        <p className="text-gray-600">
                          O Sistema de Rastreamento da Cadeia de Suprimentos é
                          uma solução integrada que combina blockchain e banco
                          de dados tradicional para garantir a transparência e
                          segurança no rastreamento de produtos.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Gestão de Produtos
                        </h3>
                        <p className="text-gray-600">
                          Aprenda como gerenciar produtos, incluindo cadastro,
                          edição, e rastreamento através da cadeia de
                          suprimentos.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Monitoramento Logístico
                        </h3>
                        <p className="text-gray-600">
                          Informações sobre como monitorar condições de
                          transporte, armazenamento e qualidade dos produtos em
                          tempo real.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tutorials">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Primeiros Passos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Video className="h-32 w-full bg-gray-100 rounded-lg mb-2" />
                        <p className="text-sm text-gray-600">
                          Tutorial básico sobre como começar a usar o sistema.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Gestão de Produtos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Video className="h-32 w-full bg-gray-100 rounded-lg mb-2" />
                        <p className="text-sm text-gray-600">
                          Como gerenciar produtos no sistema.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support">
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSupportMessage} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Entre em contato com o suporte
                      </h3>
                      <div className="space-y-4">
                        <Input placeholder="Assunto" className="mb-2" />
                        <textarea
                          className="w-full min-h-[100px] p-2 border rounded-md"
                          placeholder="Descreva sua dúvida ou problema..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button type="submit" className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;
