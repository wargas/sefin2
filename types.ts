export type Receita = {
    id?: string
    name: string,
    ir: boolean
    saude: boolean
    previdencia: boolean
    teto: boolean,
    value: number
}