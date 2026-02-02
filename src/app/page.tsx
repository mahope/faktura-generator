"use client";

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";

interface FakturaLinje {
  id: number;
  beskrivelse: string;
  antal: number;
  enhedspris: number;
}

interface Afsender {
  firmanavn: string;
  adresse: string;
  postnrBy: string;
  cvr: string;
  email: string;
  telefon: string;
  bank: string;
  regKonto: string;
}

interface Modtager {
  firmanavn: string;
  adresse: string;
  postnrBy: string;
  cvr: string;
  att: string;
}

export default function FakturaGenerator() {
  const [fakturaNr, setFakturaNr] = useState<string>(`${new Date().getFullYear()}-001`);
  const [fakturaDato, setFakturaDato] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [betalingsfrist, setBetalingsfrist] = useState<number>(14);
  const [momssats, setMomssats] = useState<number>(25);

  const [afsender, setAfsender] = useState<Afsender>({
    firmanavn: "",
    adresse: "",
    postnrBy: "",
    cvr: "",
    email: "",
    telefon: "",
    bank: "",
    regKonto: "",
  });

  const [modtager, setModtager] = useState<Modtager>({
    firmanavn: "",
    adresse: "",
    postnrBy: "",
    cvr: "",
    att: "",
  });

  const [linjer, setLinjer] = useState<FakturaLinje[]>([
    { id: 1, beskrivelse: "", antal: 1, enhedspris: 0 },
  ]);

  const [noter, setNoter] = useState<string>("");

  // Beregninger
  const subtotal = useMemo(() => {
    return linjer.reduce((sum, l) => sum + l.antal * l.enhedspris, 0);
  }, [linjer]);

  const moms = useMemo(() => {
    return subtotal * (momssats / 100);
  }, [subtotal, momssats]);

  const total = useMemo(() => {
    return subtotal + moms;
  }, [subtotal, moms]);

  // Forfaldsdato
  const forfaldsdato = useMemo(() => {
    const dato = new Date(fakturaDato);
    dato.setDate(dato.getDate() + betalingsfrist);
    return dato.toISOString().split("T")[0];
  }, [fakturaDato, betalingsfrist]);

  // Tilføj linje
  const tilfoejLinje = () => {
    const nyId = Math.max(...linjer.map((l) => l.id), 0) + 1;
    setLinjer([...linjer, { id: nyId, beskrivelse: "", antal: 1, enhedspris: 0 }]);
  };

  // Fjern linje
  const fjernLinje = (id: number) => {
    if (linjer.length > 1) {
      setLinjer(linjer.filter((l) => l.id !== id));
    }
  };

  // Opdater linje
  const opdaterLinje = (id: number, felt: keyof FakturaLinje, vaerdi: string | number) => {
    setLinjer(
      linjer.map((l) => (l.id === id ? { ...l, [felt]: vaerdi } : l))
    );
  };

  // Formatér tal
  const formatKr = (beloeb: number) => {
    return beloeb.toLocaleString("da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formatér dato
  const formatDato = (dato: string) => {
    return new Date(dato).toLocaleDateString("da-DK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Generer PDF
  const genererPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header - Afsender
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(afsender.firmanavn || "Dit Firma", 20, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y += 8;
    if (afsender.adresse) doc.text(afsender.adresse, 20, y);
    y += 5;
    if (afsender.postnrBy) doc.text(afsender.postnrBy, 20, y);
    y += 5;
    if (afsender.cvr) doc.text(`CVR: ${afsender.cvr}`, 20, y);
    y += 5;
    if (afsender.email) doc.text(afsender.email, 20, y);
    if (afsender.telefon) doc.text(`Tlf: ${afsender.telefon}`, 100, y);

    // Faktura titel
    y = 20;
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("FAKTURA", pageWidth - 20, y, { align: "right" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    y += 10;
    doc.text(`Fakturanr.: ${fakturaNr}`, pageWidth - 20, y, { align: "right" });
    y += 5;
    doc.text(`Fakturadato: ${formatDato(fakturaDato)}`, pageWidth - 20, y, { align: "right" });
    y += 5;
    doc.text(`Forfaldsdato: ${formatDato(forfaldsdato)}`, pageWidth - 20, y, { align: "right" });

    // Modtager
    y = 70;
    doc.setFont("helvetica", "bold");
    doc.text("Faktureres til:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    if (modtager.att) doc.text(`Att: ${modtager.att}`, 20, y);
    y += 5;
    doc.text(modtager.firmanavn || "Kundenavn", 20, y);
    y += 5;
    if (modtager.adresse) doc.text(modtager.adresse, 20, y);
    y += 5;
    if (modtager.postnrBy) doc.text(modtager.postnrBy, 20, y);
    y += 5;
    if (modtager.cvr) doc.text(`CVR: ${modtager.cvr}`, 20, y);

    // Linjer header
    y = 115;
    doc.setFillColor(59, 130, 246);
    doc.rect(20, y - 5, pageWidth - 40, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Beskrivelse", 25, y);
    doc.text("Antal", 110, y, { align: "right" });
    doc.text("Enhedspris", 140, y, { align: "right" });
    doc.text("Beløb", pageWidth - 25, y, { align: "right" });

    // Linjer
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 10;

    linjer.forEach((linje) => {
      const linjeTotal = linje.antal * linje.enhedspris;
      doc.text(linje.beskrivelse || "-", 25, y);
      doc.text(linje.antal.toString(), 110, y, { align: "right" });
      doc.text(`${formatKr(linje.enhedspris)} kr.`, 140, y, { align: "right" });
      doc.text(`${formatKr(linjeTotal)} kr.`, pageWidth - 25, y, { align: "right" });
      y += 8;
    });

    // Totaler
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(110, y, pageWidth - 20, y);
    y += 8;
    
    doc.text("Subtotal:", 120, y);
    doc.text(`${formatKr(subtotal)} kr.`, pageWidth - 25, y, { align: "right" });
    y += 7;
    
    doc.text(`Moms (${momssats}%):`, 120, y);
    doc.text(`${formatKr(moms)} kr.`, pageWidth - 25, y, { align: "right" });
    y += 7;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("I alt:", 120, y);
    doc.text(`${formatKr(total)} kr.`, pageWidth - 25, y, { align: "right" });

    // Betalingsinfo
    y += 25;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Betalingsoplysninger", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    if (afsender.bank) doc.text(`Bank: ${afsender.bank}`, 20, y);
    y += 5;
    if (afsender.regKonto) doc.text(`Reg.nr. og kontonr.: ${afsender.regKonto}`, 20, y);
    y += 5;
    doc.text(`Betalingsfrist: ${betalingsfrist} dage`, 20, y);

    // Noter
    if (noter) {
      y += 15;
      doc.setFont("helvetica", "bold");
      doc.text("Noter:", 20, y);
      doc.setFont("helvetica", "normal");
      y += 6;
      const splitNoter = doc.splitTextToSize(noter, pageWidth - 40);
      doc.text(splitNoter, 20, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Genereret med GratisFaktura.dk - Gratis dansk fakturagenerator",
      pageWidth / 2,
      285,
      { align: "center" }
    );

    // Download
    doc.save(`faktura-${fakturaNr}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gratis Faktura Generator 🧾
          </h1>
          <p className="mt-2 text-gray-600">
            Opret professionelle fakturaer på dansk - helt gratis, ingen login krævet
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form sektion */}
          <div className="space-y-6">
            {/* Faktura info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Faktura Info
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fakturanummer
                  </label>
                  <input
                    type="text"
                    value={fakturaNr}
                    onChange={(e) => setFakturaNr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fakturadato
                  </label>
                  <input
                    type="date"
                    value={fakturaDato}
                    onChange={(e) => setFakturaDato(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betalingsfrist (dage)
                  </label>
                  <input
                    type="number"
                    value={betalingsfrist}
                    onChange={(e) => setBetalingsfrist(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Momssats (%)
                  </label>
                  <select
                    value={momssats}
                    onChange={(e) => setMomssats(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={25}>25% (standard)</option>
                    <option value={0}>0% (momsfritaget)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Afsender */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏢 Din virksomhed (afsender)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firmanavn *
                  </label>
                  <input
                    type="text"
                    value={afsender.firmanavn}
                    onChange={(e) =>
                      setAfsender({ ...afsender, firmanavn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Dit Firma ApS"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={afsender.adresse}
                    onChange={(e) =>
                      setAfsender({ ...afsender, adresse: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Hovedgaden 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postnr. og by
                  </label>
                  <input
                    type="text"
                    value={afsender.postnrBy}
                    onChange={(e) =>
                      setAfsender({ ...afsender, postnrBy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1000 København"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVR-nummer
                  </label>
                  <input
                    type="text"
                    value={afsender.cvr}
                    onChange={(e) =>
                      setAfsender({ ...afsender, cvr: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={afsender.email}
                    onChange={(e) =>
                      setAfsender({ ...afsender, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="faktura@firma.dk"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={afsender.telefon}
                    onChange={(e) =>
                      setAfsender({ ...afsender, telefon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={afsender.bank}
                    onChange={(e) =>
                      setAfsender({ ...afsender, bank: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Danske Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reg.nr. + Kontonr.
                  </label>
                  <input
                    type="text"
                    value={afsender.regKonto}
                    onChange={(e) =>
                      setAfsender({ ...afsender, regKonto: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 0012345678"
                  />
                </div>
              </div>
            </div>

            {/* Modtager */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                👤 Kunde (modtager)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firmanavn / Navn *
                  </label>
                  <input
                    type="text"
                    value={modtager.firmanavn}
                    onChange={(e) =>
                      setModtager({ ...modtager, firmanavn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Kundens Firma A/S"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Att. (kontaktperson)
                  </label>
                  <input
                    type="text"
                    value={modtager.att}
                    onChange={(e) =>
                      setModtager({ ...modtager, att: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Anders Andersen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVR-nummer
                  </label>
                  <input
                    type="text"
                    value={modtager.cvr}
                    onChange={(e) =>
                      setModtager({ ...modtager, cvr: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="87654321"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={modtager.adresse}
                    onChange={(e) =>
                      setModtager({ ...modtager, adresse: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sidevej 2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postnr. og by
                  </label>
                  <input
                    type="text"
                    value={modtager.postnrBy}
                    onChange={(e) =>
                      setModtager({ ...modtager, postnrBy: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2000 Frederiksberg"
                  />
                </div>
              </div>
            </div>

            {/* Fakturalinjer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📝 Fakturalinjer
              </h2>
              <div className="space-y-3">
                {linjer.map((linje, index) => (
                  <div
                    key={linje.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      {index === 0 && (
                        <label className="block text-xs text-gray-500 mb-1">
                          Beskrivelse
                        </label>
                      )}
                      <input
                        type="text"
                        value={linje.beskrivelse}
                        onChange={(e) =>
                          opdaterLinje(linje.id, "beskrivelse", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Webudvikling"
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && (
                        <label className="block text-xs text-gray-500 mb-1">
                          Antal
                        </label>
                      )}
                      <input
                        type="number"
                        value={linje.antal}
                        onChange={(e) =>
                          opdaterLinje(linje.id, "antal", Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        min={1}
                      />
                    </div>
                    <div className="col-span-3">
                      {index === 0 && (
                        <label className="block text-xs text-gray-500 mb-1">
                          Pris (kr.)
                        </label>
                      )}
                      <input
                        type="number"
                        value={linje.enhedspris}
                        onChange={(e) =>
                          opdaterLinje(
                            linje.id,
                            "enhedspris",
                            Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        min={0}
                        step={100}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      {index === 0 && (
                        <label className="block text-xs text-gray-500 mb-1 opacity-0">
                          Fjern
                        </label>
                      )}
                      <button
                        onClick={() => fjernLinje(linje.id)}
                        className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={linjer.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={tilfoejLinje}
                className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                + Tilføj linje
              </button>
            </div>

            {/* Noter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💬 Noter (valgfrit)
              </h2>
              <textarea
                value={noter}
                onChange={(e) => setNoter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tak for samarbejdet! Ved spørgsmål kontakt..."
              />
            </div>
          </div>

          {/* Preview og download sektion */}
          <div className="space-y-6">
            {/* Totaler */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white sticky top-4">
              <h2 className="text-lg font-medium opacity-90">Faktura Total</h2>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-80">Subtotal:</span>
                  <span>{formatKr(subtotal)} kr.</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Moms ({momssats}%):</span>
                  <span>{formatKr(moms)} kr.</span>
                </div>
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>I alt:</span>
                    <span>{formatKr(total)} kr.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-80">
                <p>📅 Forfaldsdato: {formatDato(forfaldsdato)}</p>
              </div>
              <button
                onClick={genererPDF}
                className="mt-6 w-full py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors text-lg shadow-lg"
              >
                📄 Download PDF
              </button>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                👀 Forhåndsvisning
              </h2>
              <div className="border rounded-lg p-4 text-sm bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{afsender.firmanavn || "Dit Firma"}</p>
                    <p className="text-gray-500">{afsender.adresse}</p>
                    <p className="text-gray-500">{afsender.postnrBy}</p>
                    {afsender.cvr && (
                      <p className="text-gray-500">CVR: {afsender.cvr}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">FAKTURA</p>
                    <p className="text-gray-500">Nr: {fakturaNr}</p>
                    <p className="text-gray-500">Dato: {formatDato(fakturaDato)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold">Til:</p>
                  <p>{modtager.firmanavn || "Kundenavn"}</p>
                  {modtager.att && <p className="text-gray-500">Att: {modtager.att}</p>}
                </div>

                <table className="w-full mt-4 text-xs">
                  <thead>
                    <tr className="bg-blue-500 text-white">
                      <th className="py-1 px-2 text-left">Beskrivelse</th>
                      <th className="py-1 px-2 text-right">Antal</th>
                      <th className="py-1 px-2 text-right">Pris</th>
                      <th className="py-1 px-2 text-right">Beløb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linjer.map((linje) => (
                      <tr key={linje.id} className="border-b">
                        <td className="py-1 px-2">{linje.beskrivelse || "-"}</td>
                        <td className="py-1 px-2 text-right">{linje.antal}</td>
                        <td className="py-1 px-2 text-right">
                          {formatKr(linje.enhedspris)}
                        </td>
                        <td className="py-1 px-2 text-right">
                          {formatKr(linje.antal * linje.enhedspris)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <p>Subtotal: {formatKr(subtotal)} kr.</p>
                  <p>Moms: {formatKr(moms)} kr.</p>
                  <p className="font-bold text-lg">Total: {formatKr(total)} kr.</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-medium">💡 Tips:</p>
              <ul className="mt-2 space-y-1 text-blue-700">
                <li>• Din data gemmes KUN lokalt i din browser</li>
                <li>• PDF&apos;en genereres på din computer - intet uploades</li>
                <li>• Husk at medtage CVR-nummer på fakturaen</li>
                <li>• Standard betalingsfrist i DK er typisk 14-30 dage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <section className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Gratis fakturaskabelon til danske virksomheder
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              Med vores gratis fakturagenerator kan du hurtigt oprette professionelle 
              fakturaer på dansk. Perfekt til freelancere, enkeltmandsvirksomheder og 
              små virksomheder der har brug for en simpel løsning.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Hvad skal en dansk faktura indeholde?
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dit CVR-nummer</li>
              <li>Kundens navn og adresse</li>
              <li>Unikt fakturanummer</li>
              <li>Fakturadato og forfaldsdato</li>
              <li>Beskrivelse af varer/ydelser</li>
              <li>Beløb ekskl. og inkl. moms</li>
              <li>Dit bankkontonummer</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Momsfritagelse
            </h3>
            <p>
              Hvis din årlige omsætning er under 50.000 kr., kan du være momsfritaget. 
              I så fald vælger du 0% moms og skriver &quot;Momsfritaget jf. momslovens § 13&quot; 
              i noterne.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 GratisFaktura.dk - Gratis dansk fakturagenerator</p>
          <p className="mt-1">
            Ingen login, ingen betaling, ingen data gemt online.
          </p>
        </footer>
      </div>
    </main>
  );
}
