import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ComponentProps, useCallback, useRef, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Receita } from "@/types";

const INITAL_STATE = {
    name: '',
    value: 0,
    ir: true,
    saude: true,
    previdencia: true,
    teto: true
} as Receita

type Props = {
    onSave?: (receita: Receita) => void
} & ComponentProps<"dialog">

export function FormProventos({ children, onSave: onChange }: Props) {

    const [receita, setReceita] = useState<Receita>(INITAL_STATE)

    const refButtonClose = useRef<HTMLButtonElement>(null)

    const changeValue = useCallback((data: Partial<Receita>) => {
        setReceita(old => ({ ...old, ...data }))
    }, [receita])

    const handleChange = useCallback(() => {
        if(onChange) {
            onChange(receita)
        }
        refButtonClose.current?.click()
    }, [receita])

    return <Dialog onOpenChange={() => setReceita(INITAL_STATE)}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Adicionar Provento</DialogTitle>
                <DialogDescription>Informe dados de proventos para simular</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
                <div className="grid grid-cols-4 gap-4">

                    <div className="col-span-3">
                        <Label>Descrição</Label>
                        <Input value={receita?.name} onChange={v => changeValue({ name: v.target.value })} />
                    </div>
                    <div>
                        <Label>Valor</Label>
                        <Input
                            value={(receita.value).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                            onChange={ev => changeValue({ value: parseFloat(ev.target.value.replaceAll('.', '').replace(',', '') || '0') / 100 })} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Label>
                        <Checkbox checked={receita.ir} onCheckedChange={c => changeValue({ ir: c as boolean })} />
                        Base cálculo do IR
                    </Label>
                    <Label>
                        <Checkbox checked={receita.saude} onCheckedChange={c => changeValue({ saude: c as boolean })} />
                        Base cálculo do IPM Saúde
                    </Label>
                    <Label>
                        <Checkbox checked={receita.previdencia} onCheckedChange={c => changeValue({ previdencia: c as boolean })} />
                        Base cálculo da previdência
                    </Label>
                    <Label>
                        <Checkbox checked={receita.teto} onCheckedChange={c => changeValue({ teto: c as boolean })} />
                        Base cálculo para o teto
                    </Label>
                </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button ref={refButtonClose} variant={'outline'}>Cancelar</Button>
                </DialogClose>
                <Button onClick={handleChange}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}