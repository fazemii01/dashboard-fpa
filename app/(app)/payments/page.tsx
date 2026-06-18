"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = () => {
    setLoading(true);
    apiRequest("/super-admin/payments")
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div>
        <h3 className="text-2xl font-bold text-default-900">Riwayat Pembayaran</h3>
        <p className="text-default-500 text-sm">Log transaksi pembelian kredit lembaga dan log top-up saldo.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat riwayat pembayaran..." />
        </div>
      ) : (
        <Table aria-label="Payments logging table">
          <TableHeader>
            <TableColumn>ID LOG</TableColumn>
            <TableColumn>NAMA LEMBAGA</TableColumn>
            <TableColumn>NOMINAL PEMBAYARAN</TableColumn>
            <TableColumn>KREDIT DITAMBAHKAN</TableColumn>
            <TableColumn>NOMOR REFERENSI</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL TRANSAKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Tidak ada riwayat transaksi ditemukan">
            {payments.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-default-400">#{item.id}</TableCell>
                <TableCell className="font-semibold text-default-800">{item.lembaga_name}</TableCell>
                <TableCell className="text-success font-semibold">{formatRupiah(item.amount)}</TableCell>
                <TableCell>
                  <Chip color="secondary" variant="flat" size="sm">
                    +{item.credits_added} Kredit
                  </Chip>
                </TableCell>
                <TableCell className="font-mono text-sm">{item.reference_no || "-"}</TableCell>
                <TableCell>
                  <Chip color="success" variant="flat" size="sm">
                    {item.status.toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell className="text-default-500 text-xs">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
