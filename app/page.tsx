"use client"

import { FormParams } from "@/components/form-params";
import { FormProventos } from "@/components/form-provento";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useHook } from "@/lib/hook";
import { cn, formatNumber } from "@/lib/utils";
import { sortBy, sumBy } from "lodash";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, PlusIcon, SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showMenu, setShowMenu] = useState(true)
  const { changeValue, removeOutrasReceitasById, descontos, receitas, params, setOutrasReceitas } = useHook()

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar (desktop) */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 border-r bg-card transition-all",
          showMenu ? "w-96" : "w-0 overflow-hidden border-r-0"
        )}
      >
        <div className="sticky top-0 h-screen overflow-y-auto p-4 w-96">
          <h2 className="font-semibold mb-4">Parâmetros</h2>
          <FormParams params={params} changeValue={changeValue} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4">
        <Card className="container mx-auto">
          <CardHeader>
            <div className="flex gap-2 items-center">
              <Button variant="outline" className="hidden lg:inline-flex" onClick={() => setShowMenu(!showMenu)} title="Mostrar/ocultar parâmetros">
                {showMenu ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
              </Button>

              {/* Sidebar (mobile) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden" title="Parâmetros">
                    <SlidersHorizontalIcon />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Parâmetros</SheetTitle>
                    <SheetDescription>Configure os dados para simular o contracheque</SheetDescription>
                  </SheetHeader>
                  <FormParams params={params} changeValue={changeValue} className="px-4 pb-4" />
                </SheetContent>
              </Sheet>

              <CardTitle className="ml-2">Contracheque</CardTitle>
              <div className="ml-auto"></div>
              <FormProventos onSave={r => setOutrasReceitas(old => ([...old, { ...r, id: Math.random().toString() }]))}>
                <Button variant={'outline'}><PlusIcon /> provento</Button>
              </FormProventos>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableBody>
                {sortBy(receitas, 'value').reverse().filter(r => r.value > 0).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="uppercase group pl-10 font-light">
                      {r.name}
                      {r?.id && (
                        <span onClick={() => removeOutrasReceitasById(r.id || '')} className="ml-4 lowercase opacity-0 group-hover:opacity-100 cursor-pointer">excluir</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end font-bold">{formatNumber(r.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableHead className="bg-accent">Receita bruta</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(receitas, 'value'))}</TableHead>
                </TableRow>
                {sortBy(descontos, 'value').filter(d => d.value > 0).reverse().map(d => (
                  <TableRow key={d.name}>
                    <TableCell className="uppercase pl-10 font-light">{d.name}</TableCell>
                    <TableCell className="text-end font-bold">{formatNumber(d.value)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableHead className="bg-accent">Descontos</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(descontos, 'value'))}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="bg-accent">Líquido</TableHead>
                  <TableHead className="text-end font-bold bg-accent">{formatNumber(sumBy(receitas, 'value') - sumBy(descontos, 'value'))}</TableHead>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
