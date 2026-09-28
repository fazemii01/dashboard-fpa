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
  Spinner,
  Card,
  CardBody,
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";
import { useUser } from "@/helpers/user-context";

interface RedeemCodeItem {
  id: number;
  code: string;
  credits: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  is_expired: boolean;
  is_exhausted: boolean;
  remaining_uses: number;
  created_at: string;
}

export default function RedeemCodesPage() {
  const toast = useToast();
  const { user } = useUser();
  const [codes, setCodes] = useState<RedeemCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const createModal = useDisclosure();
  const [newCode, setNewCode] = useState("");
  const [newCredits, setNewCredits] = useState("1");
  const [newMaxUses, setNewMaxUses] = useState("1");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Modal
  const qrModal = useDisclosure();
  const [selectedQrCode, setSelectedQrCode] = useState<RedeemCodeItem | null>(null);

  // Delete confirmation modal
  const deleteModal = useDisclosure();
  const [codeToDelete, setCodeToDelete] = useState<RedeemCodeItem | null>(null);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/redeem-codes");
      setCodes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat daftar kode redeem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleGenerateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(`JB-${rand}`);
  };

  const handleCreateCode = async () => {
    try {
      setIsSubmitting(true);
      const payload: any = {
        credits: parseInt(newCredits, 10) || 1,
        max_uses: parseInt(newMaxUses, 10) || 1,
      };
      if (newCode.trim()) {
        payload.code = newCode.trim().toUpperCase();
      }
      if (newExpiresAt) {
        payload.expires_at = new Date(newExpiresAt).toISOString();
      }

      await apiRequest("/redeem-codes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.show("Kode redeem berhasil dibuat!", "success");
      createModal.onClose();
      setNewCode("");
      setNewCredits("1");
      setNewMaxUses("1");
      setNewExpiresAt("");
      fetchCodes();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kode redeem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: RedeemCodeItem) => {
    try {
      await apiRequest(`/redeem-codes/${item.id}/toggle`, {
        method: "PATCH",
      });
      toast.show(`Status kode ${item.code} berhasil diperbarui`, "success");
      setCodes((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status kode");
    }
  };

  const handleDeleteCode = async () => {
    if (!codeToDelete) return;
    try {
      await apiRequest(`/redeem-codes/${codeToDelete.id}`, {
        method: "DELETE",
      });
      toast.show(`Kode ${codeToDelete.code} berhasil dihapus`, "success");
      deleteModal.onClose();
      setCodeToDelete(null);
      setCodes((prev) => prev.filter((c) => c.id !== codeToDelete.id));
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus kode redeem");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.show(`Kode ${text} disalin ke clipboard!`, "success");
  };

  const filteredCodes = codes.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aggregated Stats
  const totalCodes = codes.length;
  const activeCodes = codes.filter((c) => c.is_active && !c.is_expired && !c.is_exhausted).length;
  const totalClaims = codes.reduce((acc, c) => acc + c.used_count, 0);
  const totalCreditsGiven = codes.reduce((acc, c) => acc + c.used_count * c.credits, 0);

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Manajemen Kode Redeem</h1>
          <p className="text-sm text-default-500">
            Buat dan kelola kuota pemindaian biometrik untuk pengguna atau orang tua.
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => {
            handleGenerateRandomCode();
            createModal.onOpen();
          }}
        >
          [+] Buat Kode Redeem
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4">
            <span className="text-xs text-default-500 font-semibold uppercase tracking-wider">
              Total Kode
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-default-900">{totalCodes}</span>
              <span className="text-xs text-default-400">terdaftar</span>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4">
            <span className="text-xs text-default-500 font-semibold uppercase tracking-wider">
              Kode Aktif
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-success">{activeCodes}</span>
              <span className="text-xs text-default-400">siap klaim</span>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4">
            <span className="text-xs text-default-500 font-semibold uppercase tracking-wider">
              Total Klaim Terpakai
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-primary">{totalClaims}</span>
              <span className="text-xs text-default-400">orang / penukaran</span>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-default-200 shadow-sm">
          <CardBody className="p-4">
            <span className="text-xs text-default-500 font-semibold uppercase tracking-wider">
              Total Kredit Disalurkan
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-warning">{totalCreditsGiven}</span>
              <span className="text-xs text-default-400">kuota scan</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 items-center">
        <Input
          className="max-w-xs"
          placeholder="Cari kode..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          isClearable
          onClear={() => setSearchQuery("")}
        />
      </div>

      {/* Table */}
      <div className="w-full">
        <Table aria-label="Tabel Kode Redeem" shadow="sm">
          <TableHeader>
            <TableColumn>KODE REDEEM</TableColumn>
            <TableColumn>KREDIT PER KLAIM</TableColumn>
            <TableColumn>KUOTA PENGGUNA</TableColumn>
            <TableColumn>KEDALUWARSA</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>AKTIF</TableColumn>
            <TableColumn align="center">AKSI</TableColumn>
          </TableHeader>
          <TableBody
            items={filteredCodes}
            isLoading={loading}
            loadingContent={<Spinner label="Memuat kode redeem..." />}
            emptyContent="Tidak ada data kode redeem."
          >
            {(item) => {
              const isExpired = item.is_expired;
              const isExhausted = item.is_exhausted;
              let statusLabel = "Aktif";
              let statusColor: "success" | "warning" | "danger" | "default" = "success";

              if (!item.is_active) {
                statusLabel = "Nonaktif";
                statusColor = "default";
              } else if (isExpired) {
                statusLabel = "Kedaluwarsa";
                statusColor = "danger";
              } else if (isExhausted) {
                statusLabel = "Habis";
                statusColor = "warning";
              }

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-default-800 text-sm tracking-wide bg-default-100 px-2 py-1 rounded">
                        {item.code}
                      </span>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => copyToClipboard(item.code)}
                        title="Salin kode"
                      >
                        [copy]
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        isIconOnly
                        onPress={() => {
                          setSelectedQrCode(item);
                          qrModal.onOpen();
                        }}
                        title="Tampilkan QR Code"
                      >
                        [QR]
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color="primary" variant="flat">
                      {item.credits} Scan
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex justify-between text-xs text-default-600">
                        <span>
                          {item.used_count} / {item.max_uses} klaim
                        </span>
                        <span className="font-semibold text-default-400">
                          {item.remaining_uses} sisa
                        </span>
                      </div>
                      <div className="w-full bg-default-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isExhausted ? "bg-warning" : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (item.used_count / Math.max(1, item.max_uses)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-default-600">
                      {item.expires_at
                        ? new Date(item.expires_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Tanpa batas"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={statusColor} variant="dot">
                      {statusLabel}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={item.is_active}
                      onValueChange={() => handleToggleActive(item)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => {
                          setCodeToDelete(item);
                          deleteModal.onOpen();
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModal.isOpen} onOpenChange={createModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Buat Kode Redeem Baru
              </ModalHeader>
              <ModalBody className="gap-4">
                <div>
                  <label className="text-xs font-semibold text-default-700 mb-1 block">
                    Kode Redeem
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Contoh: JB-PROMO2026"
                      value={newCode}
                      onValueChange={setNewCode}
                    />
                    <Button
                      variant="flat"
                      onPress={handleGenerateRandomCode}
                      className="whitespace-nowrap"
                    >
                      Acak
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Kredit per Penukaran"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newCredits}
                    onValueChange={setNewCredits}
                    description="Berapa kuota scan yang didapat"
                  />
                  <Input
                    label="Maksimal Pengguna"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newMaxUses}
                    onValueChange={setNewMaxUses}
                    description="Berapa orang yang bisa klaim"
                  />
                </div>

                <Input
                  label="Tanggal Kedaluwarsa (Opsional)"
                  type="date"
                  value={newExpiresAt}
                  onValueChange={setNewExpiresAt}
                  description="Kosongkan jika berlaku selamanya"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateCode}
                  isLoading={isSubmitting}
                >
                  Simpan & Terbitkan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={qrModal.isOpen} onOpenChange={qrModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-center">
                QR Code Penukaran
              </ModalHeader>
              <ModalBody className="flex flex-col items-center gap-4 py-6">
                {selectedQrCode && (
                  <>
                    <div className="p-4 bg-white border border-default-200 rounded-xl shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          selectedQrCode.code
                        )}`}
                        alt={`QR Code ${selectedQrCode.code}`}
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-xl font-bold text-default-800 tracking-wider">
                        {selectedQrCode.code}
                      </p>
                      <p className="text-sm text-default-500 mt-1">
                        Memberikan {selectedQrCode.credits} Kuota Scan Sidik Jari
                      </p>
                      <p className="text-xs text-default-400 mt-0.5">
                        Sisa kuota: {selectedQrCode.remaining_uses} dari {selectedQrCode.max_uses} pengguna
                      </p>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className="justify-center">
                {selectedQrCode && (
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => copyToClipboard(selectedQrCode.code)}
                  >
                    Salin Teks Kode
                  </Button>
                )}
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onOpenChange={deleteModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Konfirmasi Hapus</ModalHeader>
              <ModalBody>
                <p className="text-default-700">
                  Apakah Anda yakin ingin menghapus kode redeem{" "}
                  <strong className="font-mono">{codeToDelete?.code}</strong>?
                  Kode yang sudah dihapus tidak dapat ditukarkan lagi.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="danger" onPress={handleDeleteCode}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

