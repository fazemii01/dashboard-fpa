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
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";
import { useUser } from "@/helpers/user-context";

export default function InvoicesPage() {
  const toast = useToast();
  const { user } = useUser();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const approveModal = useDisclosure();
  const [approving, setApproving] = useState(false);
  const deleteModal = useDisclosure();
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Request top-up modal states for super_admin
  const requestTopupModal = useDisclosure();
  const [reqCredits, setReqCredits] = useState(10);
  const [reqClientName, setReqClientName] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    apiRequest("/invoices")
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const confirmDelete = async () => {
    if (invoiceToDelete === null) return;
    setDeleting(true);
    try {
      await apiRequest(`/invoices/${invoiceToDelete}`, {
        method: "DELETE",
      });
      deleteModal.onClose();
      setInvoiceToDelete(null);
      fetchInvoices();
      toast.success("Invoice berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus invoice");
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    setApproving(true);
    try {
      await apiRequest(`/invoices/${selectedInvoice.id}/approve`, {
        method: "POST",
      });
      approveModal.onClose();
      setSelectedInvoice(null);
      fetchInvoices();
      toast.success("Pembayaran invoice berhasil disetujui! Kredit telah ditambahkan.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyetujui invoice");
    } finally {
      setApproving(false);
    }
  };

  const handleRequestTopup = async () => {
    if (reqCredits <= 0) {
      toast.warning("Jumlah kredit harus bernilai positif");
      return;
    }
    setRequesting(true);
    try {
      const res = await apiRequest("/invoices", {
        method: "POST",
        body: JSON.stringify({
          credits: Number(reqCredits),
          client_name: reqClientName || user?.full_name || user?.email,
          description: reqDescription || "Request Top Up Kredit Wilayah",
          lembaga_id: null,
        }),
      });
      setGeneratedInvoice(res);
      fetchInvoices();
      toast.success("Invoice request top-up berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat invoice");
    } finally {
      setRequesting(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "waiting_verification":
        return "warning";
      case "pending":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Lunas";
      case "waiting_verification":
        return "Menunggu Verifikasi";
      case "pending":
        return "Belum Dibayar";
      default:
        return status;
    }
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-default-900">Manajemen Invoice</h3>
          <p className="text-default-500 text-sm">Kelola tagihan credit top-up lembaga, verifikasi bukti transfer, dan approve transaksi.</p>
        </div>
        {user?.role === "super_admin" && (
          <Button color="primary" onPress={requestTopupModal.onOpen}>
            Request Top Up Wilayah
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat daftar invoice..." />
        </div>
      ) : (
        <Table aria-label="Invoice management table">
          <TableHeader>
            <TableColumn>KODE INVOICE</TableColumn>
            <TableColumn>NAMA LEMBAGA</TableColumn>
            <TableColumn>WILAYAH</TableColumn>
            <TableColumn>ATAS NAMA</TableColumn>
            <TableColumn>DESKRIPSI</TableColumn>
            <TableColumn>KREDIT</TableColumn>
            <TableColumn>TOTAL TAGIHAN</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL DIBUAT</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Belum ada invoice yang dibuat">
            {invoices.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-default-600 font-semibold">{item.code}</TableCell>
                <TableCell className="font-semibold text-default-800">
                  {item.lembaga_name || (
                    <span className="text-primary font-semibold italic">Top-Up Regional</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.wilayah_name ? (
                    <span className="font-semibold text-default-700">{item.wilayah_name}</span>
                  ) : (
                    <span className="text-xs text-default-400 italic">Global</span>
                  )}
                </TableCell>
                <TableCell>{item.client_name}</TableCell>
                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="secondary">
                    {item.credits} Kredit
                  </Chip>
                </TableCell>
                <TableCell className="text-success font-semibold">{formatRupiah(item.total_amount)}</TableCell>
                <TableCell>
                  <Chip color={getStatusColor(item.status)} variant="flat" size="sm">
                    {getStatusLabel(item.status)}
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
                      color="primary"
                      onPress={() => window.open(`/invoice/${item.uuid}`, "_blank")}
                    >
                      Buka Invoice
                    </Button>

                    {item.status !== "success" && (
                      <Button
                        size="sm"
                        variant="solid"
                        color="success"
                        onPress={() => {
                          setSelectedInvoice(item);
                          approveModal.onOpen();
                        }}
                      >
                        Approve
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => {
                        setInvoiceToDelete(item.id);
                        deleteModal.onOpen();
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* APPROVAL & PROOF VERIFICATION MODAL */}
      <Modal 
        isOpen={approveModal.isOpen} 
        onClose={() => {
          approveModal.onClose();
          setSelectedInvoice(null);
        }}
        size="2xl"
      >
        <ModalContent>
          {selectedInvoice && (
            <>
              <ModalHeader>Verifikasi Pembayaran - {selectedInvoice.code}</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2 p-3 bg-default-50 border border-divider rounded-xl text-sm">
                  <div>
                    <span className="text-default-500 block">Lembaga</span>
                    <span className="font-semibold">{selectedInvoice.lembaga_name}</span>
                  </div>
                  <div>
                    <span className="text-default-500 block">Klien / Pembayar</span>
                    <span className="font-semibold">{selectedInvoice.client_name}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-default-500 block">Kredit Ditambahkan</span>
                    <span className="font-semibold text-secondary">{selectedInvoice.credits} Kredit</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-default-500 block">Total Tagihan</span>
                    <span className="font-semibold text-success">{formatRupiah(selectedInvoice.total_amount)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-default-700">Lampiran Bukti Transfer:</span>
                  {selectedInvoice.payment_proof_url ? (
                    <div className="border border-divider rounded-xl overflow-hidden bg-default-100 flex items-center justify-center p-2 min-h-[300px]">
                      {selectedInvoice.payment_proof_path?.toLowerCase().endsWith(".pdf") ? (
                        <iframe
                          src={selectedInvoice.payment_proof_url}
                          className="w-full h-[400px] border-0"
                        />
                      ) : (
                        <img
                          src={selectedInvoice.payment_proof_url}
                          alt="Bukti Transfer"
                          className="max-h-[400px] max-w-full object-contain rounded-lg shadow-sm"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-divider rounded-xl p-8 text-center bg-default-50 text-default-400 text-sm">
                      Klien belum mengunggah bukti pembayaran transfer bank.
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={() => {
                    approveModal.onClose();
                    setSelectedInvoice(null);
                  }}
                >
                  Batal
                </Button>
                <Button 
                  color="success" 
                  isLoading={approving}
                  onPress={handleApprove}
                >
                  Approve / Selesaikan Pembayaran
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={() => {
          deleteModal.onClose();
          setInvoiceToDelete(null);
        }}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p className="text-default-600 text-sm">
              Apakah Anda yakin ingin menghapus invoice ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="flat" 
              onPress={() => {
                deleteModal.onClose();
                setInvoiceToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button 
              color="danger" 
              isLoading={deleting}
              onPress={confirmDelete}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* REQUEST TOP-UP MODAL */}
      <Modal 
        isOpen={requestTopupModal.isOpen} 
        onClose={() => {
          requestTopupModal.onClose();
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
                    <span className="text-default-500">Nama Wilayah</span>
                    <span className="font-semibold">{user?.wilayah_name || "Regional"}</span>
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
                    requestTopupModal.onClose();
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
              <ModalHeader>Request Top Up Wilayah</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                <Input
                  label="Jumlah Kredit"
                  type="number"
                  placeholder="Contoh: 10"
                  variant="bordered"
                  value={reqCredits.toString()}
                  onChange={(e) => setReqCredits(Math.max(1, Number(e.target.value)))}
                />
                <Input
                  label="Atas Nama Pemohon"
                  placeholder="Masukkan nama Anda..."
                  variant="bordered"
                  value={reqClientName}
                  onChange={(e) => setReqClientName(e.target.value)}
                />
                <Input
                  label="Keterangan"
                  placeholder="Masukkan deskripsi request..."
                  variant="bordered"
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={requestTopupModal.onClose}
                >
                  Batal
                </Button>
                <Button 
                  color="primary" 
                  isLoading={requesting}
                  onPress={handleRequestTopup}
                >
                  Kirim Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
