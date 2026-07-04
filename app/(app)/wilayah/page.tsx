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
  Spinner
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";

export default function WilayahPage() {
  const toast = useToast();
  const [wilayahList, setWilayahList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals disclosure
  const createModal = useDisclosure();
  const topupModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();

  // Selected wilayah for actions
  const [selectedWilayah, setSelectedWilayah] = useState<any>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(0);

  const [topupCredits, setTopupCredits] = useState(10);
  const [editName, setEditName] = useState("");
  const [editCredits, setEditCredits] = useState(0);

  const fetchWilayah = () => {
    setLoading(true);
    apiRequest("/super-admin/wilayah")
      .then((data) => {
        setWilayahList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWilayah();
  }, []);

  const handleCreate = async () => {
    try {
      if (!newName.trim()) {
        toast.warning("Nama wilayah tidak boleh kosong");
        return;
      }
      await apiRequest("/super-admin/wilayah", {
        method: "POST",
        body: JSON.stringify({ name: newName, credits: Number(newCredits) }),
      });
      createModal.onClose();
      setNewName("");
      setNewCredits(0);
      fetchWilayah();
      toast.success("Wilayah berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat wilayah");
    }
  };

  const handleTopup = async () => {
    try {
      if (topupCredits <= 0) {
        toast.warning("Jumlah kredit harus bernilai positif");
        return;
      }
      await apiRequest(`/super-admin/wilayah/${selectedWilayah.id}/topup`, {
        method: "POST",
        body: JSON.stringify({ credits: Number(topupCredits) }),
      });
      topupModal.onClose();
      setTopupCredits(10);
      fetchWilayah();
      toast.success(`Kredit wilayah ${selectedWilayah.name} berhasil ditambahkan!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan top-up wilayah");
    }
  };

  const handleEdit = async () => {
    try {
      if (!editName.trim()) {
        toast.warning("Nama wilayah tidak boleh kosong");
        return;
      }
      await apiRequest(`/super-admin/wilayah/${selectedWilayah.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          credits: Number(editCredits),
        }),
      });
      editModal.onClose();
      fetchWilayah();
      toast.success("Wilayah berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui wilayah");
    }
  };

  const handleDelete = async () => {
    try {
      await apiRequest(`/super-admin/wilayah/${selectedWilayah.id}`, {
        method: "DELETE",
      });
      deleteModal.onClose();
      fetchWilayah();
      toast.success("Wilayah berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus wilayah");
    }
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-default-900">Manajemen Wilayah</h3>
          <p className="text-default-500 text-sm">Daftar wilayah/kota, sisa kredit reseller, super admin, dan lembaga terhubung.</p>
        </div>
        <Button color="primary" onPress={createModal.onOpen}>
          Tambah Wilayah
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat data wilayah..." />
        </div>
      ) : (
        <Table aria-label="Wilayah management table">
          <TableHeader>
            <TableColumn>NAMA WILAYAH / KOTA</TableColumn>
            <TableColumn>SALDO KREDIT RESELLER</TableColumn>
            <TableColumn>SUPER ADMIN DIKAITKAN</TableColumn>
            <TableColumn>JUMLAH LEMBAGA</TableColumn>
            <TableColumn>TANGGAL DIBUAT</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Tidak ada data wilayah">
            {wilayahList.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-semibold text-default-900">{w.name}</TableCell>
                <TableCell>
                  <span className="font-bold text-primary">{w.credits}</span> Kredit
                </TableCell>
                <TableCell>
                  {w.super_admin_email ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-default-800">{w.super_admin_name || "Tanpa Nama"}</span>
                      <span className="text-xs text-default-400">{w.super_admin_email}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-warning bg-warning-500/10 px-2.5 py-1 rounded-full font-semibold border border-warning-500/20">Belum Dikaitkan</span>
                  )}
                </TableCell>
                <TableCell>{w.lembaga_count} Lembaga</TableCell>
                <TableCell>{new Date(w.created_at).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => {
                        setSelectedWilayah(w);
                        setTopupCredits(10);
                        topupModal.onOpen();
                      }}
                    >
                      Top Up
                    </Button>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      onPress={() => {
                        setSelectedWilayah(w);
                        setEditName(w.name);
                        setEditCredits(w.credits);
                        editModal.onOpen();
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        setSelectedWilayah(w);
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

      {/* CREATE WILAYAH MODAL */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose}>
        <ModalContent>
          <ModalHeader>Tambah Wilayah Baru</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Nama Wilayah / Kota"
              placeholder="Masukkan nama wilayah (misal: Jakarta, Bandung)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              type="number"
              label="Saldo Kredit Reseller Awal"
              value={String(newCredits)}
              onChange={(e) => setNewCredits(Math.max(0, Number(e.target.value)))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={createModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleCreate}>Simpan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* TOPUP WILAYAH MODAL */}
      <Modal isOpen={topupModal.isOpen} onClose={topupModal.onClose}>
        <ModalContent>
          <ModalHeader>Top Up Kredit Wilayah: {selectedWilayah?.name}</ModalHeader>
          <ModalBody>
            <Input
              type="number"
              label="Jumlah Kredit Tambahan"
              placeholder="Masukkan jumlah kredit"
              value={String(topupCredits)}
              onChange={(e) => setTopupCredits(Math.max(1, Number(e.target.value)))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={topupModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleTopup}>Top Up</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT WILAYAH MODAL */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose}>
        <ModalContent>
          <ModalHeader>Edit Wilayah: {selectedWilayah?.name}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Nama Wilayah / Kota"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              type="number"
              label="Saldo Kredit Reseller"
              value={String(editCredits)}
              onChange={(e) => setEditCredits(Math.max(0, Number(e.target.value)))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={editModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleEdit}>Simpan Perubahan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE WILAYAH MODAL */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus Wilayah</ModalHeader>
          <ModalBody>
            <p className="text-default-600 text-sm">
              Apakah Anda yakin ingin menghapus wilayah <strong>{selectedWilayah?.name}</strong>?
            </p>
            <p className="text-danger text-xs font-semibold mt-2">
              Peringatan: Lembaga dan Super Admin yang terhubung dengan wilayah ini akan dilepas dari wilayah ini. Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={deleteModal.onClose}>Batal</Button>
            <Button color="danger" onPress={handleDelete}>Hapus Permanen</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
