"use client"

import { FormProventos } from "@/components/form-provento";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { config } from "@/lib/config";
import { useHook } from "@/lib/hook";
import { cn, formatNumber } from "@/lib/utils";
import { sortBy, sumBy } from "lodash";
import { EyeIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showMenu, setShowMenu] = useState(true)
  const { changeValue, removeOutrasReceitasById, descontos, bcIR, bcPrevidencia, bcSaude, receitas, params, setParams, outrasReceitas, setOutrasReceitas } = useHook()

  return (
    <div className="flex flex-col mx-auto container p-4 gap-4">

      <div className="font-sans container mt-4 mx-auto">
        <Card>
          <CardHeader>
            <div className={cn({ "grid": showMenu, "hidden": !showMenu }, "transition-all grid-cols-2 lg:grid-cols-7 gap-4")}>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dependentes IR" htmlFor="">Cargo</Label>
                <Select value={params.cargo} onValueChange={v => changeValue({ cargo: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Titulação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUDITOR">AUDITOR</SelectItem>
                    <SelectItem value="ANALISTA">ANALISTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dependentes IR" htmlFor="">Classe/Nível</Label>
                <Select value={params.nivel} onValueChange={v => changeValue({ nivel: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Classe/Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="grid grid-cols-6">

                      {Object.keys(config.tabela.AUDITOR).map(n => (
                        <SelectItem key={n} value={n}>
                          <span className="">{['I', 'II', 'III', 'IV', 'V', 'VI'][parseInt(n[0])-1]}{' '}{n.substring(1)}</span>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dependentes IR" htmlFor="">
                  Dependentes IR
                  {params.dependentesIR > 0 && <span className="" onClick={() => changeValue({ dependentesIR: 0 })}>limpar</span>}
                </Label>
                <Input min={0} type="number" value={params.dependentesIR.toString()} onChange={ev => changeValue({ dependentesIR: parseInt(ev.target.value || '0') })} />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Dependentes Salário Família" htmlFor="">
                  Dependentes SF
                  {params.dependentesSF > 0 && <span className="" onClick={() => changeValue({ dependentesSF: 0 })}>limpar</span>}
                </Label>
                <Input min={0} type="number" value={params.dependentesSF.toString()} onChange={ev => changeValue({ dependentesSF: parseInt(ev.target.value || '0') })} />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="Alíquota CEPREV" htmlFor="">
                  Alíquota CEPREV
                  {params.complementar > 0 && <span className="" onClick={() => changeValue({ complementar: 0 })}>limpar</span>}
                  {params.complementar == 0 && <span className="" onClick={() => changeValue({ complementar: 8.5 })}>máx</span>}
                </Label>
                <Input
                  value={(params.complementar).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
                  onChange={ev => changeValue({ complementar: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 10 })}
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="" className="line-clamp-1">ITA</Label>
                <Select value={params.ita.toString()} onValueChange={v => changeValue({ ita: parseFloat(v) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Titulação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem titulação</SelectItem>
                    <SelectItem value="0.15">15% (Pós)</SelectItem>
                    <SelectItem value="0.35">35% (Mestrado)</SelectItem>
                    <SelectItem value="0.45">45% (Doutorado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="% GDF" htmlFor="">% GDF</Label>
                <Input value={params.gdf.toString()} onChange={v => changeValue({ gdf: parseInt(v.target.value) })} />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="FIDAF" htmlFor="">
                  FIDAF
                  {params.fidaf > 0 && <span className="" onClick={() => changeValue({ fidaf: 0 })}>limpar</span>}
                </Label>
                <Input
                  value={(params.fidaf).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ fidaf: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })} />
              </div>
              <div className="col-span-1">

                <Label className="line-clamp-1 flex" title="pontos RAV" htmlFor="">
                  <span className="mr-auto">Pontos RAV</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      Opções
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => changeValue({ rav: 0 })}>0 (SEM RAV)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeValue({ rav: 600 })}>600 (ANALISTA)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeValue({ rav: 800 })}>800 (AUDITOR)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Label>

                <Input
                  value={params.rav.toString()}
                  onChange={ev => changeValue({ rav: parseInt(ev.target.value) })} />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 flex justify-between" title="FIDAF" htmlFor="">
                  SINDICATO
                  {params.sindicato > 0 && <span className="" onClick={() => changeValue({ sindicato: 0 })}>limpar</span>}
                </Label>
                <Input
                  value={(params.sindicato).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ sindicato: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })}
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="">Desconto saúde</Label>
                <Select value={params.saude ? '1' : '0'} onValueChange={v => changeValue({ saude: v == '1' })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Desconto saúde" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sim</SelectItem>
                    <SelectItem value="0">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label htmlFor="">Respeita o teto</Label>
                <Select value={params.teto ? '1' : '0'} onValueChange={v => changeValue({ teto: v == '1' })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Desconto saúde" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sim</SelectItem>
                    <SelectItem value="0">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Ajuste</span>
                  {params.ajuste > 0 && <span className="" onClick={() => changeValue({ ajuste: 0 })}>limpar</span>}
                </Label>
                <Input
                  value={(params.ajuste).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ ajuste: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })}
                />
              </div>
              <div className="col-span-1">
                <Label className="line-clamp-1 justify-between flex" title="Ajuste" htmlFor="">
                  <span>Consignados</span>
                  {params.consignado > 0 && <span className="" onClick={() => changeValue({ consignado: 0 })}>limpar</span>}
                </Label>
                <Input
                  value={(params.consignado).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  onChange={ev => changeValue({ consignado: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })}
                />
              </div>
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <Button onClick={() => setShowMenu(!showMenu)}>
                <EyeIcon />
              </Button>
              <div className="ml-auto"></div>
              <FormProventos onSave={r => setOutrasReceitas(old => ([...old, { ...r, id: Math.random().toString() }]))}>
                <Button variant={'outline'}><PlusIcon /> provento</Button>
              </FormProventos>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableBody>
                {sortBy(receitas, 'value').reverse().filter(r => r.value > 0).map(r => (
                  <TableRow key={r.name}>
                    <TableCell className="uppercase group pl-10 font-light">
                      {r.name}
                      {r.id && (
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
                  <TableRow>
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
      </div>
    </div>
  );
}
