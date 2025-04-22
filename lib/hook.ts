import { config } from "@/lib/config";
import { Receita } from "@/types";
import { filter, sumBy } from "lodash";
import { useCallback, useMemo, useState } from "react";

export function useHook() {
    const [outrasReceitas, setOutrasReceitas] = useState<Receita[]>([])

    const [params, setParams] = useState({
        dependentesIR: 0,
        dependentesSF: 0,
        gdf: 100,
        ita: 0.15,
        complementar: 8.5,
        sindicato: 240,
        cargo: 'AUDITOR',
        fidaf: 0,
        rav: 0,
        saude: true,
        teto: true,
        ajuste: 0,
        consignado: 0
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
                value: baseGdf * params.gdf / 100
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
            { name: 'desconto teto', value: descontoTeto },
            { name: 'consignados', value: params.consignado }
        ]
    }, [receitas, params])

    const changeValue = useCallback((data: Partial<typeof params>) => {
        setParams(p => ({ ...p, ...data }))
    }, [params])


    const removeOutrasReceitasById = useCallback((id: string) => {
        setOutrasReceitas(old => old.filter(o => o.id != id))
    }, [outrasReceitas])

    return { changeValue, removeOutrasReceitasById, descontos, bcIR, bcPrevidencia, bcSaude, receitas, params, setParams, outrasReceitas, setOutrasReceitas }
}