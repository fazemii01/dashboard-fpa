"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Spinner, Chip, Button } from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";

export default function PublicInvoicePage() {
  const toast = useToast();
  const params = useParams();
  const uuid = params?.uuid as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInvoice = async () => {
    try {
      const res = await apiRequest(`/invoices/public/${uuid}`);
      setInvoice(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      fetchInvoice();
    }
  }, [uuid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      toast.warning("Silakan pilih file bukti transfer terlebih dahulu.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await apiRequest(`/invoices/public/${uuid}/upload-proof`, {
        method: "POST",
        body: formData,
      });

      setInvoice(res);
      setSelectedFile(null);
      setShowPaymentForm(false);
      toast.success("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Spinner size="lg" />
        <p className="text-default-500 text-sm">Memuat data invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 px-4 text-center">
        <h3 className="text-xl font-bold text-danger">Invoice Tidak Ditemukan</h3>
        <p className="text-default-500 max-w-sm text-sm">
          Link invoice salah atau invoice telah dihapus oleh pihak admin. Silakan periksa kembali tautan Anda.
        </p>
      </div>
    );
  }

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
        return "Pending Verification";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const createdDate = new Date(invoice.created_at);
  const dueDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <>
      {/* Load external Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="mx-auto max-w-4xl">
          {/* Top Actions (Hides on print) */}
          <div className="print:hidden mb-6 flex justify-between items-center">
            <span className="inline-flex items-center text-sm font-medium text-slate-600">
              Invoice Link: <span className="font-mono text-xs ml-1 text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{invoice.uuid}</span>
            </span>
            <button 
              onClick={() => window.print()} 
              className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
            >
              <svg className="mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </button>
          </div>

          {/* Invoice Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-[#0361fc] flex items-center justify-center text-white font-bold text-2xl shadow-md overflow-hidden">
                    {/* Placeholder branding/logo */}
                    <div className="text-white text-center leading-none text-xs font-black select-none px-1">
                      ALLIA FPA
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Allia Go</h1>
                    <p className="text-xs text-slate-500 font-medium">Allia Tab Fingers</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-3xl font-light tracking-widest text-slate-400 uppercase">Tagihan</h2>
                  <p className="mt-2 text-sm font-bold text-slate-700">{invoice.code}</p>
                </div>
              </div>

              {/* Details */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-slate-100 pb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Ditagihkan Kepada</p>
                  <h3 className="text-base font-bold text-slate-900">{invoice.lembaga_name || "Lembaga Umum"}</h3>
                  <p className="mt-1 text-sm text-slate-500 font-medium">u.p. {invoice.client_name}</p>
                  
                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keterangan:</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{invoice.description}</p>
                  </div>
                </div>
                
                <div className="md:text-right space-y-4">
                  <div className="flex justify-between md:justify-end gap-8">
                    <span className="text-sm text-slate-400">Tanggal Diterbitkan:</span>
                    <span className="text-sm font-bold text-slate-700">
                      {createdDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between md:justify-end gap-8">
                    <span className="text-sm text-slate-400">Jatuh Tempo:</span>
                    <span className="text-sm font-bold text-slate-700">
                      {dueDate.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between md:justify-end items-center gap-8 pt-2">
                    <span className="text-sm text-slate-400">Status:</span>
                    <Chip 
                      color={getStatusColor(invoice.status)} 
                      variant="flat" 
                      size="sm" 
                      className="uppercase font-bold text-[10px] tracking-wider"
                    >
                      {getStatusLabel(invoice.status)}
                    </Chip>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-12">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Deskripsi</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-6 text-sm font-semibold text-slate-800">
                        Top Up {invoice.credits} Kredit Aplikasi<br />
                        <span className="text-slate-400 font-normal text-xs">Penambahan saldo kuota kupon laporan FPA (1 Kredit = {formatRupiah(300000)})</span>
                      </td>
                      <td className="py-6 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                        {formatRupiah(invoice.credits * 300000)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-8 flex justify-end">
                <div className="w-full max-w-sm space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-semibold">Subtotal</span>
                    <span className="text-xs font-bold text-slate-800">{formatRupiah(invoice.credits * 300000)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-xs text-danger">
                      <span className="font-semibold">Potongan Diskon</span>
                      <span className="font-bold">-{formatRupiah(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-800">Total Keseluruhan</span>
                    <span className="text-base font-black text-[#0361fc]">
                      {formatRupiah(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions & Proof Upload Section */}
              {invoice.status === "pending" && (
                <div className="print:hidden mt-10 pt-10 border-t border-slate-100 flex flex-col gap-6">
                  {!showPaymentForm ? (
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full font-bold bg-[#0361fc] text-white hover:bg-blue-700 transition rounded-xl py-6"
                      onPress={() => setShowPaymentForm(true)}
                    >
                      Lanjutkan Pembayaran
                    </Button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col gap-6 animate-fade-in">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Instruksi Pembayaran Bank Transfer</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Silakan transfer nominal total tagihan di atas ke rekening resmi berikut:
                        </p>
                        <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl font-sans text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Bank</span>
                            <span className="font-bold text-slate-800">Bank Mandiri</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-2">
                            <span className="text-slate-400 font-medium">No. Rekening</span>
                            <span className="font-bold text-[#0361fc] text-base">123-456-7890</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-2">
                            <span className="text-slate-400 font-medium">Atas Nama</span>
                            <span className="font-bold text-slate-800">PT ALLIA Indonesia</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unggah Bukti Transfer</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        <div 
                          className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                          </svg>
                          {selectedFile ? (
                            <span className="text-xs text-[#0361fc] font-bold">{selectedFile.name}</span>
                          ) : (
                            <span className="text-xs text-slate-400 text-center font-medium">Klik untuk memilih file bukti transfer (Format Image / PDF)</span>
                          )}
                        </div>

                        <div className="flex gap-3 mt-2">
                          <Button
                            variant="flat"
                            className="flex-1 rounded-xl font-bold"
                            onPress={() => {
                              setShowPaymentForm(false);
                              setSelectedFile(null);
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            color="primary"
                            className="flex-1 bg-[#0361fc] text-white hover:bg-blue-700 transition rounded-xl font-bold"
                            isLoading={uploading}
                            onPress={handleUploadProof}
                            isDisabled={!selectedFile}
                          >
                            Kirim Bukti Pembayaran
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {invoice.status === "waiting_verification" && (
                <div className="print:hidden mt-10 pt-10 border-t border-slate-100">
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                    <p className="text-sm text-amber-800 font-semibold">
                      Bukti transfer pembayaran Anda telah diunggah dan sedang dalam proses verifikasi.
                    </p>
                    {invoice.payment_proof_url && (
                      <Button
                        size="sm"
                        color="warning"
                        variant="light"
                        className="mt-3 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                        onPress={() => window.open(invoice.payment_proof_url, "_blank")}
                      >
                        Lihat Bukti Pembayaran Terunggah
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {invoice.status === "success" && (
                <div className="print:hidden mt-10 pt-10 border-t border-slate-100">
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                    <p className="text-sm text-emerald-800 font-bold">
                      Pembayaran tagihan telah diterima. Terima kasih! Kredit FPA telah sukses ditambahkan ke saldo lembaga.
                    </p>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="bg-slate-900 px-8 py-6 text-center border-t border-slate-800">
              <p className="text-xs text-slate-400 font-medium">
                Terima kasih telah menggunakan layanan Allia. Untuk pertanyaan terkait tagihan ini, silakan hubungi support@alliago.id.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
