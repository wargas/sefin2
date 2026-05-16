import { config } from "@/lib/config";
import { Receita } from "@/types";
import { filter, sumBy } from "lodash";
import { useCallback, useMemo, useState } from "react";

export function useHook() {
  const [outrasReceitas, setOutrasReceitas] = useState<Receita[]>([]);

  const [params, setParams] = useState({
    dependentesIR: 0,
    nivel: "1A",
    dependentesSF: 0,
    gdf: 100,
    ita: 0.15,
    complementar: 8.5,
    sindicato: 240,
    cargo: "AUDITOR",
    fidaf: 0,
    rav: 800,
    saude: true,
    teto: true,
    ajuste: 0,
    consignado: 0,
    diasTrabalhados: 30,
  });

  const ajuste = useMemo(() => 1 + params.ajuste / 100, [params]);
  const tetoPrefeito = config.remuneracaoPrefeito * ajuste;

  const teto = params.teto ? tetoPrefeito : config.remuneracaoSTF;

  const receitas = useMemo(() => {
    const cargo = params.cargo as "AUDITOR" | "ANALISTA";

    const nivel = params.nivel as "1A";
    const vencimento =
      config.tabela[cargo][nivel] * config.ajustes["2026-01-01"] * ajuste;

    const baseGdf =
      config.tabela[cargo]["4A"] * config.ajustes["2026-01-01"] * 0.4 * ajuste;

    const coeficienteTrabalhado = params.diasTrabalhados / 30;

    return [
      {
        name: "vencimento",
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: vencimento * coeficienteTrabalhado,
        referencia: '',
        id: null
      },
      {
        name: "ita",
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: vencimento * params.ita * coeficienteTrabalhado,
        referencia: '',
        id: null
      },
      {
        name: "gdf",
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: ((baseGdf * params.gdf) / 100) * coeficienteTrabalhado,
        referencia: '',
        id: null
      },
      {
        name: "RAV",
        ir: true,
        saude: true,
        previdencia: true,
        teto: true,
        value: params.rav * config.valorPontoRAV * coeficienteTrabalhado,
        referencia: '',
        id: null
      },
      {
        name: "salario-familia",
        ir: false,
        saude: false,
        previdencia: false,
        teto: false,
        value: 8.13 * params.dependentesSF,
        referencia: '',
        id: null
      },
      {
        name: "combustivel",
        ir: false,
        saude: false,
        previdencia: false,
        teto: false,
        value:
          (params.cargo == "AUDITOR" ? 1652.45 : 0) * coeficienteTrabalhado,
        referencia: '',
        id: null
      },
      {
        name: "fidaf",
        ir: true,
        saude: false,
        previdencia: false,
        teto: !params.teto,
        value: params.fidaf,
        referencia: '',
        id: null
      },
      ...outrasReceitas,
    ];
  }, [params, config, outrasReceitas, teto]);

  const bcSaude = useMemo(() => {
    let geral_teto = sumBy(
      filter(receitas, { saude: true, teto: true }),
      "value",
    );
    let geral_no_teto = sumBy(
      filter(receitas, { saude: true, teto: false }),
      "value",
    );

    if (geral_teto > teto) {
      geral_teto = teto;
    }

    return geral_teto + geral_no_teto;
  }, [receitas]);

  const bcPrevidencia = useMemo(() => {
    let geral_teto = sumBy(
      filter(receitas, { previdencia: true, teto: true }),
      "value",
    );
    let geral_no_teto = sumBy(
      filter(receitas, { previdencia: true, teto: false }),
      "value",
    );

    if (geral_teto > teto) {
      geral_teto = teto;
    }

    const geral = geral_teto + geral_no_teto;

    const bcPrevifor = config.tetoINSS;
    const bcComplementar = geral - bcPrevifor;

    return {
      previdor: bcPrevifor,
      complementar: bcComplementar,
    };
  }, [receitas]);

  const bcIR = useMemo(() => {
    const descontoDependente = params.dependentesIR * 189.59;

    const valorFidaf = sumBy(filter(receitas, { name: 'fidaf' }), 'value')
    var descontoTetoFidaf = 0

    let bc_teto = sumBy(filter(receitas, { ir: true, teto: true }), "value");

    let bc_sem_teto = sumBy(
      filter(receitas, { ir: true, teto: false }),
      "value",
    ) - valorFidaf;

    if (bc_teto > teto) {
      bc_teto = teto;
    }

    if (params.teto) {
      descontoTetoFidaf = Math.max(0, bc_teto + valorFidaf - config.remuneracaoSTF)
    }

    console.log({ descontoTetoFidaf, bc_teto, valorFidaf })

    if (!params.teto && bc_teto > config.remuneracaoSTF) {
      bc_teto = config.remuneracaoSTF
    }

    return bc_teto + bc_sem_teto + valorFidaf - descontoTetoFidaf - descontoDependente;
  }, [receitas, params]);

  const descontos = useMemo(() => {
    const valorPrevidor = bcPrevidencia.previdor * 0.14;
    const valorCeprev =
      bcPrevidencia.complementar * (params.complementar / 100);

    const bcIR2 = bcIR - valorPrevidor - valorCeprev;

    const valorIR = bcIR2 * 0.275 - 908.73;

    const receitasTeto = sumBy(filter(receitas, { teto: true }), "value");

    const valorFidaf = sumBy(filter(receitas, { name: 'fidaf' }), 'value')

    var descontoTeto = 0;

    if (teto < receitasTeto) {
      descontoTeto = receitasTeto - teto
    }

    if (params.teto && (receitasTeto + valorFidaf) > config.remuneracaoSTF) {
      descontoTeto += (receitasTeto + valorFidaf) - config.remuneracaoSTF
    }



    return [
      {id:null, referencia: ``, name: "saude", value: params.saude ? bcSaude * 0.02 : 0 },
      {id:null, referencia: ``, name: "previfor", value: valorPrevidor },
      {id:null, referencia: ``, name: "ceprev", value: valorCeprev },
      {id:null, referencia: ``, name: "sindicato", value: params.sindicato },
      {id:null, referencia: ``, name: "irpf", value: valorIR },
      {id:null, referencia: ``, name: "desconto teto", value: descontoTeto },
      {id:null, referencia: ``, name: "consignados", value: params.consignado },
    ];
  }, [receitas, params]);

  const changeValue = useCallback(
    (data: Partial<typeof params>) => {
      setParams((p) => ({ ...p, ...data }));
    },
    [params],
  );

  const removeOutrasReceitasById = useCallback(
    (id: string) => {
      setOutrasReceitas((old) => old.filter((o) => o.id != id));
    },
    [outrasReceitas],
  );

  return {
    changeValue,
    removeOutrasReceitasById,
    descontos,
    bcIR,
    bcPrevidencia,
    bcSaude,
    receitas,
    params,
    setParams,
    outrasReceitas,
    setOutrasReceitas,
  };
}
