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
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Switch,
  Spinner,
  Input
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [lembaga, setLembaga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const editModal = useDisclosure();
  const createModal = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Edit form states
  const [editRole, setEditRole] = useState("");
  const [editLembagaId, setEditLembagaId] = useState<string>("");
  const [editActive, setEditActive] = useState(true);

  // Create form states
  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("staff");
  const [createLembagaId, setCreateLembagaId] = useState<string>("none");

  const handleCreate = async () => {
    if (!createEmail || !createPassword) {
      toast.error("Email dan password wajib diisi!");
      return;
    }
    try {
      const lid = createRole === "super_admin" || createLembagaId === "none" || !createLembagaId ? null : Number(createLembagaId);
      await apiRequest("/super-admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          full_name: createFullName || null,
          role: createRole,
          lembaga_id: lid,
        }),
      });
      
      // Reset form states
      setCreateFullName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("staff");
      setCreateLembagaId("none");
      
      createModal.onClose();
      fetchData();
      toast.success("User baru berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan user baru");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersData = await apiRequest("/super-admin/users");
      const lembagaData = await apiRequest("/super-admin/lembaga");
      setUsers(usersData);
      setLembaga(lembagaData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async () => {
    try {
      const lid = editLembagaId === "none" || !editLembagaId ? null : Number(editLembagaId);
      await apiRequest(`/super-admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          role: editRole,
          lembaga_id: lid,
          is_active: editActive,
        }),
      });
      editModal.onClose();
      fetchData();
      toast.success("User berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui user");
    }
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold text-default-900">Audit Pengguna</h3>
          <p className="text-default-500 text-sm">Kelola hak akses pengguna, asosiasi lembaga, dan status keaktifan akun.</p>
        </div>
        <Button color="primary" onPress={createModal.onOpen}>
          Tambah Pengguna
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat data pengguna..." />
        </div>
      ) : (
        <Table aria-label="Users management table">
          <TableHeader>
            <TableColumn>NAMA PENGGUNA</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>LEMBAGA</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL GABUNG</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Tidak ada pengguna ditemukan">
            {users.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.full_name || "-"}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <Chip
                    color={
                      item.role === "super_admin"
                        ? "secondary"
                        : item.role === "admin"
                        ? "primary"
                        : "default"
                    }
                    variant="flat"
                    size="sm"
                  >
                    {item.role.toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell className="font-medium text-default-700">
                  {item.lembaga_name || (
                    <span className="text-default-400 italic">Tidak Terikat (Global)</span>
                  )}
                </TableCell>
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
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={() => {
                      setSelectedUser(item);
                      setEditRole(item.role);
                      setEditLembagaId(item.lembaga_id ? item.lembaga_id.toString() : "none");
                      setEditActive(item.is_active);
                      editModal.onOpen();
                    }}
                  >
                    Edit Akses
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* EDIT MODAL */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose}>
        <ModalContent>
          <ModalHeader>Edit Hak Akses Pengguna</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-default-800">{selectedUser?.full_name}</span>
              <span className="text-xs text-default-500">{selectedUser?.email}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Peran / Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Lembaga Admin</option>
                <option value="staff">Lembaga Staff</option>
              </select>
            </div>

            {editRole !== "super_admin" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-600">Asosiasi Lembaga</label>
                <select
                  value={editLembagaId}
                  onChange={(e) => setEditLembagaId(e.target.value)}
                  className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
                >
                  <option value="none">-- Tanpa Lembaga --</option>
                  {lembaga.map((lem) => (
                    <option key={lem.id} value={lem.id.toString()}>
                      {lem.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between p-2 border border-divider rounded-xl">
              <span className="text-sm">Status Akun Aktif</span>
              <Switch isSelected={editActive} onValueChange={setEditActive} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={editModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleEdit}>Perbarui</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* CREATE MODAL */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose}>
        <ModalContent>
          <ModalHeader>Tambah Pengguna Baru</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Nama Lengkap</label>
              <Input
                variant="bordered"
                placeholder="Masukkan nama lengkap"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Email</label>
              <Input
                variant="bordered"
                type="email"
                placeholder="Masukkan email pengguna"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Password</label>
              <Input
                variant="bordered"
                type="password"
                placeholder="Masukkan password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Peran / Role</label>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Lembaga Admin</option>
                <option value="staff">Lembaga Staff</option>
              </select>
            </div>

            {createRole !== "super_admin" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-600">Asosiasi Lembaga</label>
                <select
                  value={createLembagaId}
                  onChange={(e) => setCreateLembagaId(e.target.value)}
                  className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
                >
                  <option value="none">-- Tanpa Lembaga --</option>
                  {lembaga.map((lem) => (
                    <option key={lem.id} value={lem.id.toString()}>
                      {lem.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={createModal.onClose}>Batal</Button>
            <Button color="primary" onPress={handleCreate}>Simpan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
