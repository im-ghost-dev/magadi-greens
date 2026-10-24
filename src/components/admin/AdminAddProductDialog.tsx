"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_LABEL } from "@/lib/catalogue-client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AdminAddProductDialog({ open, onOpenChange, onCreated }: Props) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [cat, setCat] = useState("v");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [kn, setKn] = useState("");
  const [stock, setStock] = useState(true);
  const [busy, setBusy] = useState(false);

  function reset() {
    setId("");
    setName("");
    setCat("v");
    setUnit("kg");
    setPrice("");
    setMrp("");
    setKn("");
    setStock(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      toast.error("Pick a positive whole-number PLU");
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idNum,
          name: name.trim(),
          cat,
          unit,
          price: price.trim() === "" ? null : Number(price),
          mrp: mrp.trim() === "" ? null : Number(mrp),
          kn: kn.trim(),
          stock,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to create");
      toast.success(`Added ${name.trim()} (PLU ${idNum})`);
      reset();
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-g900">
            <Plus className="size-5" /> Add a new product
          </DialogTitle>
          <DialogDescription>
            New items appear at the bottom of their category on the storefront.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-3">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="np-id">PLU / ID</Label>
              <Input
                id="np-id"
                inputMode="numeric"
                value={id}
                onChange={(e) => setId(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="166"
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="np-name">Name *</Label>
              <Input
                id="np-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baby Corn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">per kg</SelectItem>
                  <SelectItem value="pc">each</SelectItem>
                  <SelectItem value="bunch">per bunch</SelectItem>
                  <SelectItem value="pkt">per packet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="np-price">Price ₹ (optional)</Label>
              <Input
                id="np-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="At store"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="np-mrp">MRP ₹ (optional)</Label>
              <Input
                id="np-mrp"
                inputMode="decimal"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="—"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="np-kn">Kannada name (optional)</Label>
            <Input
              id="np-kn"
              value={kn}
              onChange={(e) => setKn(e.target.value)}
              placeholder="ಕನ್ನಡ ಹೆಸರು"
            />
          </div>

          <Label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={stock} onCheckedChange={(v) => setStock(!!v)} />
            In stock today
          </Label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="bg-g600 hover:bg-g700">
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Plus className="size-4" /> Create product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
