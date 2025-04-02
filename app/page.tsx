"use client"

import { FormProventos } from "@/components/form-provento";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Receita } from "@/types";
import { filter, random, sortBy, sumBy } from "lodash";
import { ChevronDown, PlusIcon, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const config = {
  tetoINSS: 8157.4,
  valorPontoRAV: 11.54,
  remuneracaoPrefeito: 28656.54,
  "ajustes": {
    "2023-01-01": 1.0579,
    "2024-01-01": 1.09619598,
    "2024-06-01": 1.10677498
  },
  "tabela": {
    "AUDITOR": {
      "1A": 11655.00,
      "2A": 12613.37,
      "3A": 13650.54,
      "4A": 14773.00,
      "5A": 15987.76,
      "6A": 17302.40,
      "1B": 11771.55,
      "2B": 12739.50,
      "3B": 13787.05,
      "4B": 14920.73,
      "5B": 16147.64,
      "6B": 17475.43,
      "1C": 11889.27,
      "2C": 12866.90,
      "3C": 13924.92,
      "4C": 15069.94,
      "5C": 16309.11,
      "6C": 17650.18,
      "1D": 12008.16,
      "2D": 12995.57,
      "3D": 14064.17,
      "4D": 15220.64,
      "5D": 16472.20,
      "6D": 17826.68,
      "1E": 12128.24,
      "2E": 13125.52,
      "3E": 14204.81,
      "4E": 15372.85,
      "5E": 16636.93,
      "6E": 18004.95,
    },
    "ANALISTA": {
      "1A": 9324.00,
      "2A": 10090.70,
      "3A": 10920.43,
      "4A": 11818.40,
      "5A": 12790.21,
      "6A": 13841.92,
      "1B": 9417.24,
      "2B": 10191.60,
      "3B": 11029.64,
      "4B": 11936.59,
      "5B": 12918.11,
      "6B": 13980.34,
      "1C": 9511.41,
      "2C": 10293.52,
      "3C": 11139.94,
      "4C": 12055.95,
      "5C": 13047.29,
      "6C": 14120.15,
      "1D": 9606.53,
      "2D": 10396.45,
      "3D": 11251.33,
      "4D": 12176.51,
      "5D": 13177.76,
      "6D": 14261.35,
      "1E": 9702.59,
      "2E": 10500.42,
      "3E": 11363.85,
      "4E": 12298.28,
      "5E": 13309.54,
      "6E": 14403.965
    }
  }
}



export default function Home() {
  const [outrasReceitas, setOutrasReceitas] = useState<Receita[]>([])

  const [params, setParams] = useState({
    dependentesIR: 0,
    dependentesSF: 0,
    gdf: 1,
    ita: 0.15,
    complementar: 8.5,
    sindicato: 240,
    cargo: 'AUDITOR',
    fidaf: 0,
    rav: 0,
    saude: true,
    teto: true,
    ajuste: 0
  })

  const receitas = useMemo(() => {

    const ajuste = 1 + (params.ajuste / 100)

    const cargo = params.cargo as "AUDITOR" | "ANALISTA";
    const vencimento = config.tabela[cargo]["1A"] * config.ajustes["2024-06-01"] * ajuste

    const baseGdf = config.tabela[cargo]["4A"] * config.ajustes["2024-06-01"] * 0.4 * ajuste

    return [
      {
        name: 'vencimento',
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: vencimento
      },
      {
        name: 'ita',
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: vencimento * params.ita
      },
      {
        name: 'gdf',
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: baseGdf * params.gdf
      },
      {
        name: 'RAV',
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: params.rav * config.valorPontoRAV
      },
      {
        name: 'salario-familia',
        ir: false,
        saude: false,
        previdencia: false,
        teto: false,
        value: 8.13 * params.dependentesSF
      },
      {
        name: 'combustivel',
        ir: false,
        saude: false,
        previdencia: false,
        teto: false,
        value: params.cargo == 'AUDITOR' ? 1594.63 : 0
      },
      {
        name: 'fidaf',
        ir: true,
        saude: false,
        previdencia: false,
        teto: false,
        value: params.fidaf
      },
      ...outrasReceitas
    ]
  }, [params, config, outrasReceitas])

  const bcSaude = useMemo(() => {
    let geral_teto = sumBy(filter(receitas, { saude: true, teto: true }), 'value')
    let geral_no_teto = sumBy(filter(receitas, { saude: true, teto: false }), 'value')

    if (geral_teto > config.remuneracaoPrefeito && params.teto) {
      geral_teto = config.remuneracaoPrefeito
    }

    return geral_teto + geral_no_teto;
  }, [receitas])

  const bcPrevidencia = useMemo(() => {
    let geral_teto = sumBy(filter(receitas, { previdencia: true, teto: true }), 'value')
    let geral_no_teto = sumBy(filter(receitas, { previdencia: true, teto: false }), 'value')

    if (geral_teto > config.remuneracaoPrefeito && params.teto) {
      geral_teto = config.remuneracaoPrefeito
    }

    const geral = geral_teto + geral_no_teto;

    const bcPrevifor = config.tetoINSS;
    const bcComplementar = geral - bcPrevifor

    return {
      previdor: bcPrevifor,
      complementar: bcComplementar
    }

  }, [receitas])

  const bcIR = useMemo(() => {
    const descontoDependente = params.dependentesIR * 189.59

    let ir_teto = sumBy(filter(receitas, { ir: true, teto: true }), 'value')
    const ir_no_teto = sumBy(filter(receitas, { ir: true, teto: false }), 'value')

    if (ir_teto > config.remuneracaoPrefeito && params.teto) {
      ir_teto = config.remuneracaoPrefeito
    }

    return ir_teto + ir_no_teto - descontoDependente
  }, [receitas, params])

  const descontos = useMemo(() => {

    const valorPrevidor = bcPrevidencia.previdor * 0.14
    const valorCeprev = bcPrevidencia.complementar * (params.complementar / 100)

    const bcIR2 = bcIR - valorPrevidor - valorCeprev;

    const valorIR = bcIR2 * 0.275 - 896

    const receitasTeto = sumBy(filter(receitas, { teto: true }), 'value')

    const descontoTeto = (config.remuneracaoPrefeito < receitasTeto && params.teto) ? receitasTeto - config.remuneracaoPrefeito : 0

    return [
      { name: 'saude', value: params.saude ? bcSaude * 0.02 : 0 },
      { name: 'previfor', value: valorPrevidor },
      { name: 'ceprev', value: valorCeprev },
      { name: 'sindicato', value: params.sindicato },
      { name: 'irpf', value: valorIR },
      { name: 'desconto teto', value: descontoTeto }
    ]
  }, [receitas, params])

  const changeValue = useCallback((data: Partial<typeof params>) => {
    setParams(p => ({ ...p, ...data }))
  }, [params])

  
  const removeOutrasReceitasById = useCallback((id:string) => {
    setOutrasReceitas(old => old.filter(o => o.id != id))
  }, [outrasReceitas])

  return (
    <div className="flex flex-col mx-auto container p-4 gap-4">

      <div className="font-sans container mt-4 mx-auto">
        <Card>
          <CardHeader>
            <div className="grid grid-cols-6 gap-4">
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
                <Input value={'100'} />
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
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <FormProventos onSave={r => setOutrasReceitas(old => ([...old, { ...r, id: Math.random().toString() }]))}>
                <Button variant={'outline'} size={'sm'}><PlusIcon /> provento</Button>
              </FormProventos>
              <Button variant={'outline'} size={'sm'}><PlusIcon /> desconto</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableBody>
                {sortBy(receitas, 'value').reverse().filter(r => r.value > 0).map(r => (
                  <TableRow key={r.name}>
                    <TableCell className="uppercase group">
                      {r.name}
                      {r.id && (
                        <span onClick={() => removeOutrasReceitasById(r.id||'')} className="ml-4 lowercase opacity-0 group-hover:opacity-100 cursor-pointer">excluir</span>
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
                    <TableCell className="uppercase">{d.name}</TableCell>
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
