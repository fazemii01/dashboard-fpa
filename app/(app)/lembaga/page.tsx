"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Switch,
  Spinner
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";

export default function LembagaPage() {
  const toast = useToast();
  const [lembaga, setLembaga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals disclosure
  const createModal = useDisclosure();
  const topupModal = useDisclosure();
  const editModal = useDisclosure();

  // Selected lembaga for actions
  const [selectedLembaga, setSelectedLembaga] = useState<any>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(0);

  const [topupClientName, setTopupClientName] = useState("");
  const [topupDescription, setTopupDescription] = useState("");
  const [topupDiscount, setTopupDiscount] = useState("0");
  const [topupCredits, setTopupCredits] = useState("5");
  const [customCredits, setCustomCredits] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const pricePerCredit = 300000;
  const creditsToBuy = topupCredits === "custom" ? Number(customCredits) : Number(topupCredits);
  const subtotal = creditsToBuy * pricePerCredit;
  const discountVal = Number(topupDiscount) || 0;
  const totalAmount = Math.max(0, subtotal - discountVal);

  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchLembaga = () => {
    setLoading(true);
    apiRequest("/super-admin/lembaga")
      .then((data) => {
        setLembaga(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLembaga();
  }, []);

  const handleCreate = async () => {
    try {
      await apiRequest("/super-admin/lembaga", {
        method: "POST",
        body: JSON.stringify({ name: newName, credits: Number(newCredits) }),
      });
      createModal.onClose();
      setNewName("");
      setNewCredits(0);
      fetchLembaga();
      toast.success("Lembaga berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat lembaga");
    }
  };

  const handleTopup = async () => {
    try {
      const creditsVal = topupCredits === "custom" ? Number(customCredits) : Number(topupCredits);
      if (!creditsVal || creditsVal <= 0) {
        toast.warning("Jumlah kredit harus bernilai positif");
        return;
      }
      const res = await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify({
          lembaga_id: selectedLembaga.id,
          client_name: topupClientName,
          description: topupDescription,
          credits: creditsVal,
          discount: Number(topupDiscount) || 0,
        }),
      });
      setGeneratedInvoice(res);
      fetchLembaga();
      toast.success("Invoice top-up berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat invoice");
    }
  };

  const handleEdit = async () => {
    try {
      await apiRequest(`/super-admin/lembaga/${selectedLembaga.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          is_active: editActive,
        }),
      });
      editModal.onClose();
      fetchLembaga();
      toast.success("Lembaga berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui lembaga");
    }
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-default-900">Manajemen Lembaga</h3>
          <p className="text-default-500 text-sm">Daftar dan kelola lembaga, kuota kredit, serta status keaktifan.</p>
        </div>
        <Button color="primary" onPress={createModal.onOpen}>
          Tambah Lembaga
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat data lembaga..." />
        </div>
      ) : (
        <Table aria-label="Lembaga management table">
          <TableHeader>
            <TableColumn>NAMA LEMBAGA</TableColumn>
            <TableColumn>KREDIT TERSISA</TableColumn>
            <TableColumn>TOTAL USER</TableColumn>
            <TableColumn>LAPORAN TERBENTUK</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL DAFTAR</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Belum ada lembaga terdaftar">
            {lembaga.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.name}</TableCell>
                <TableCell>
                  <Chip color={item.credits < 10 ? "danger" : "success"} variant="flat" size="sm">
                    {item.credits} Kredit
                  </Chip>
                </TableCell>
                <TableCell>{item.users_count} Users</TableCell>
                <TableCell>{item.reports_count} Laporan</TableCell>
                <TableCell>
                  <Chip color={item.is_active ? "success" : "danger"} variant="dot" size="sm">
                    {item.is_active ? "Aktif" : "Non-aktif"}
                  </Chip>
                </TableCell>
                <TableCell className="text-default-500 text-xs">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={() => {
                        setSelectedLembaga(item);
                        setTopupClientName("");
                        setTopupDescription("");
                        setTopupDiscount("0");
                        setTopupCredits("5");
                        setCustomCredits("");
                        setGeneratedInvoice(null);
                        setCopied(false);
                        topupModal.onOpen();
                      }}
                    >
                      Top Up
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => {
                        setSelectedLembaga(item);
                        setEditName(item.name);
                        setEditActive(item.is_active);
                        editModal.onOpen();
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose}>
        <ModalContent>
          <ModalHeader>Tambah Lembaga Baru</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Nama Lembaga"
              placeholder="Masukkan nama lembaga..."
              variant="bordered"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Kredit Awal"
              type="number"
              placeholder="0"
              variant="bordered"
              value={newCredits.toString()}
              onChange={(e) => setNewCredits(Number(e.target.value))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={createModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleCreate} isDisabled={!newName.trim()}>Simpan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TOP UP / INVOICE GENERATOR MODAL */}
      <Modal 
        isOpen={topupModal.isOpen} 
        onClose={() => {
          topupModal.onClose();
          setGeneratedInvoice(null);
          setCopied(false);
        }}
      >
        <ModalContent>
          {generatedInvoice ? (
            <>
              <ModalHeader>Invoice Berhasil Dibuat</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 p-4 bg-default-50 border border-divider rounded-xl">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500">Klien / Atas Nama</span>
                    <span className="font-semibold">{generatedInvoice.client_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500">Jumlah Kredit</span>
                    <span className="font-semibold">{generatedInvoice.credits} Kredit</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-default-500">Total Pembayaran</span>
                    <span className="font-semibold text-success">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(generatedInvoice.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-500">Link Invoice Public:</span>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/invoice/${generatedInvoice.uuid}`}
                      variant="bordered"
                      size="sm"
                    />
                    <Button
                      size="sm"
                      color={copied ? "success" : "primary"}
                      onPress={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invoice/${generatedInvoice.uuid}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "Tersalin" : "Salin"}
                    </Button>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  variant="flat" 
                  onPress={() => window.open(`/invoice/${generatedInvoice.uuid}`, "_blank")}
                >
                  Buka Invoice
                </Button>
                <Button 
                  variant="flat" 
                  onPress={() => {
                    topupModal.onClose();
                    setGeneratedInvoice(null);
                    setCopied(false);
                  }}
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Top Up Kredit / Buat Invoice - {selectedLembaga?.name}</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input
                  label="Atas Nama / Nama Klien"
                  placeholder="Masukkan nama pembayar..."
                  variant="bordered"
                  value={topupClientName}
                  onChange={(e) => setTopupClientName(e.target.value)}
                />
                <Input
                  label="Keterangan / Deskripsi"
                  placeholder="Contoh: Top Up Kuota Ujian Periode Juli"
                  variant="bordered"
                  value={topupDescription}
                  onChange={(e) => setTopupDescription(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-default-500">Pilih Kredit (1 Kredit = Rp 300.000)</span>
                  <div className="flex gap-2 flex-wrap">
                    {["5", "10", "15", "20"].map((opt) => (
                      <Button
                        key={opt}
                        size="sm"
                        variant={topupCredits === opt ? "solid" : "flat"}
                        color={topupCredits === opt ? "primary" : "default"}
                        onPress={() => setTopupCredits(opt)}
                      >
                        {opt} Kredit
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant={topupCredits === "custom" ? "solid" : "flat"}
                      color={topupCredits === "custom" ? "primary" : "default"}
                      onPress={() => setTopupCredits("custom")}
                    >
                      Kustom / Manual
                    </Button>
                  </div>
                </div>

                {topupCredits === "custom" && (
                  <Input
                    label="Masukkan Jumlah Kredit"
                    type="number"
                    placeholder="Jumlah kredit yang diinginkan..."
                    variant="bordered"
                    value={customCredits}
                    onChange={(e) => setCustomCredits(e.target.value)}
                  />
                )}

                <Input
                  label="Diskon (IDR)"
                  type="number"
                  placeholder="0"
                  variant="bordered"
                  value={topupDiscount}
                  onChange={(e) => setTopupDiscount(e.target.value)}
                />

                <div className="p-3 bg-default-100 border border-divider rounded-xl text-sm flex flex-col gap-1">
                  <div className="flex justify-between text-default-500">
                    <span>Subtotal:</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(creditsToBuy * 300000)}
                    </span>
                  </div>
                  <div className="flex justify-between text-danger">
                    <span>Diskon:</span>
                    <span>
                      -{new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(Number(topupDiscount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-default-800 border-t border-divider pt-1">
                    <span>Total Pembayaran:</span>
                    <span>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(totalAmount)}
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={() => {
                    topupModal.onClose();
                    setGeneratedInvoice(null);
                    setCopied(false);
                  }}
                >
                  Batal
                </Button>
                <Button 
                  color="secondary" 
                  onPress={handleTopup} 
                  isDisabled={!topupClientName || !topupDescription || (topupCredits === "custom" && !customCredits)}
                >
                  Generate Invoice
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose}>
        <ModalContent>
          <ModalHeader>Edit Lembaga</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Nama Lembaga"
              variant="bordered"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <div className="flex items-center justify-between p-2 border border-divider rounded-xl">
              <span className="text-sm">Status Aktif Lembaga</span>
              <Switch isSelected={editActive} onValueChange={setEditActive} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={editModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleEdit} isDisabled={!editName.trim()}>Perbarui</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
