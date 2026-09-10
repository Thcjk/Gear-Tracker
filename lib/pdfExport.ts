import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { GearItem, PackingList } from "@/types";
import { indexGearItems, listTotalWeight } from "./calculations";
import { formatComfortTemp, formatWeight, getCategoryMeta } from "./categories";

export function exportPackingListPdf(
  list: PackingList,
  gearItems: GearItem[],
): void {
  const doc = new jsPDF();
  const totalWeight = listTotalWeight(list, gearItems);

  doc.setFontSize(18);
  doc.text(list.name, 14, 20);
  doc.setFontSize(11);
  doc.text(`Gesamtgewicht: ${formatWeight(totalWeight)}`, 14, 30);
  doc.text(`Items: ${list.items.length}`, 14, 37);

  const index = indexGearItems(gearItems);
  const rows = list.items.map((item) => {
    const gear = index.get(item.gearItemId);
    return [
      // Die Komforttemperatur hängt am Namen statt in einer eigenen Spalte:
      // sie betrifft nur Schlafsysteme, eine Spalte wäre fast überall leer.
      gear
        ? gear.comfortTempC != null
          ? `${gear.name} (${formatComfortTemp(gear.comfortTempC)})`
          : gear.name
        : "Unbekannt",
      gear ? getCategoryMeta(gear.category).label : "—",
      String(item.quantity),
      gear ? formatWeight(gear.weightGrams) : "—",
      gear ? formatWeight(gear.weightGrams * item.quantity) : "—",
      item.packed ? "Ja" : "Nein",
    ];
  });

  autoTable(doc, {
    startY: 44,
    head: [["Item", "Kategorie", "Menge", "Gewicht", "Gesamt", "Gepackt"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 107, 76] },
  });

  const safeName = list.name.replace(/[^\w\-]+/g, "_").slice(0, 40);
  doc.save(`${safeName || "packliste"}.pdf`);
}
