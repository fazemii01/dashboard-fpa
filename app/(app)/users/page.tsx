"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  Input,
  Tabs,
  Tab
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";
import { useUser } from "@/helpers/user-context";

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [lembaga, setLembaga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs and search filter states
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const editModal = useDisclosure();
  const createModal = useDisclosure();
  const deleteModal = useDisclosure();
  const { user } = useUser();
  const [wilayahList, setWilayahList] = useState<any[]>([]);
  const [createWilayahId, setCreateWilayahId] = useState<string>("none");
  const [editWilayahId, setEditWilayahId] = useState<string>("none");

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState<any>(null);

  // Edit form states
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
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
      const lid = createRole === "super_admin" || createRole === "pengguna" || createLembagaId === "none" || !createLembagaId ? null : Number(createLembagaId);
      const wid = createRole === "super_admin" && createWilayahId !== "none" ? Number(createWilayahId) : null;
      await apiRequest("/super-admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: createEmail,
          password: createPassword,
          full_name: createFullName || null,
          role: createRole,
          lembaga_id: lid,
          wilayah_id: wid,
        }),
      });
      
      // Reset form states
      setCreateFullName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("staff");
      setCreateLembagaId("none");
      setCreateWilayahId("none");
      
      createModal.onClose();
      fetchData();
      toast.success("User baru berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan user baru");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await apiRequest("/super-admin/users");
      const lembagaData = await apiRequest("/super-admin/lembaga");
      setUsers(usersData);
      setLembaga(lembagaData);
      
      if (user?.role === "admin_pusat") {
        const wilayahData = await apiRequest("/super-admin/wilayah");
        setWilayahList(wilayahData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const handleEdit = async () => {
    if (!editEmail) {
      toast.error("Email wajib diisi!");
      return;
    }
    try {
      const lid = editRole === "super_admin" || editRole === "pengguna" || editLembagaId === "none" || !editLembagaId ? null : Number(editLembagaId);
      const wid = editRole === "super_admin" && editWilayahId !== "none" ? Number(editWilayahId) : null;
      await apiRequest(`/super-admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          full_name: editFullName || null,
          email: editEmail,
          role: editRole,
          lembaga_id: lid,
          wilayah_id: wid,
          is_active: editActive,
          password: editPassword || null,
        }),
      });
      editModal.onClose();
      fetchData();
      toast.success("User berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui user");
    }
  };

  const handleDelete = async () => {
    if (!selectedDeleteUser) return;
    try {
      await apiRequest(`/super-admin/users/${selectedDeleteUser.id}`, {
        method: "DELETE",
      });
      deleteModal.onClose();
      fetchData();
      toast.success("User berhasil dihapus!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus user");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === "staff_admin") {
      if (u.role === "pengguna") return false;
    } else if (activeTab === "pengguna") {
      if (u.role !== "pengguna") return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const lem = (u.lembaga_name || "").toLowerCase();
      const wil = (u.wilayah_name || "").toLowerCase();
      return name.includes(q) || email.includes(q) || role.includes(q) || lem.includes(q) || wil.includes(q);
    }
    return true;
  });

  const totalCount = users.length;
  const staffAdminCount = users.filter((u) => u.role !== "pengguna").length;
  const penggunaCount = users.filter((u) => u.role === "pengguna").length;

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

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-default-50 dark:bg-default-100/40 p-3 rounded-2xl border border-default-200">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          color="primary"
          variant="solid"
          size="sm"
          classNames={{
            tabList: "bg-default-200/60 dark:bg-default-100 p-1 rounded-xl",
            cursor: "bg-primary shadow-sm",
            tab: "px-3 h-8",
          }}
        >
          <Tab
            key="all"
            title={
              <div className="flex items-center gap-2">
                <span>Semua Pengguna</span>
                <Chip size="sm" variant="flat" className="h-5 text-xs font-semibold">{totalCount}</Chip>
              </div>
            }
          />
          <Tab
            key="staff_admin"
            title={
              <div className="flex items-center gap-2">
                <span>Admin & Staf</span>
                <Chip size="sm" variant="flat" color="primary" className="h-5 text-xs font-semibold">{staffAdminCount}</Chip>
              </div>
            }
          />
          <Tab
            key="pengguna"
            title={
              <div className="flex items-center gap-2">
                <span>Pengguna Aplikasi</span>
                <Chip size="sm" variant="flat" color="success" className="h-5 text-xs font-semibold">{penggunaCount}</Chip>
              </div>
            }
          />
        </Tabs>

        <div className="w-full md:w-80">
          <Input
            placeholder="Cari nama, email, lembaga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            size="sm"
            variant="bordered"
            radius="lg"
            startContent={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-default-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>
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
            <TableColumn>WILAYAH</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>TANGGAL GABUNG</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent={searchQuery ? "Tidak ada pengguna yang cocok dengan pencarian" : activeTab === "pengguna" ? "Belum ada data pengguna aplikasi" : "Tidak ada pengguna ditemukan"}>
            {filteredUsers.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.full_name || "-"}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <Chip
                    color={
                      item.role === "admin_pusat"
                        ? "warning"
                        : item.role === "super_admin"
                        ? "secondary"
                        : item.role === "admin"
                        ? "primary"
                        : item.role === "staff"
                        ? "default"
                        : "success"
                    }
                    variant="flat"
                    size="sm"
                  >
                    {item.role === "pengguna" ? "PENGGUNA" : item.role.toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell className="font-medium text-default-700">
                  {item.lembaga_name || (
                    <span className="text-default-400 italic">Tidak Terikat (Global)</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.wilayah_name ? (
                    <span className="font-semibold text-default-700">{item.wilayah_name}</span>
                  ) : (
                    <span className="text-xs text-default-400 italic">Global</span>
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => {
                        setSelectedUser(item);
                        setEditFullName(item.full_name || "");
                        setEditEmail(item.email || "");
                        setEditPassword("");
                        setEditRole(item.role);
                        setEditLembagaId(item.lembaga_id ? item.lembaga_id.toString() : "none");
                        setEditWilayahId(item.wilayah_id ? item.wilayah_id.toString() : "none");
                        setEditActive(item.is_active);
                        editModal.onOpen();
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => {
                        setSelectedDeleteUser(item);
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

      {/* EDIT MODAL */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.onClose}>
        <ModalContent>
          <ModalHeader>Edit Pengguna</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Nama Lengkap</label>
              <Input
                variant="bordered"
                placeholder="Nama Lengkap"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Email</label>
              <Input
                variant="bordered"
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Password Baru (Kosongkan jika tidak ingin diubah)</label>
              <Input
                variant="bordered"
                type="password"
                placeholder="Password Baru"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-600">Peran / Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
              >
                {user?.role === "admin_pusat" && <option value="admin_pusat">Admin Pusat</option>}
                {user?.role === "admin_pusat" && <option value="super_admin">Super Admin</option>}
                <option value="admin">Lembaga Admin</option>
                <option value="staff">Lembaga Staff</option>
                <option value="pengguna">Pengguna (Aplikasi)</option>
              </select>
            </div>

            {editRole === "super_admin" && user?.role === "admin_pusat" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-600">Wilayah / Kota</label>
                <select
                  value={editWilayahId}
                  onChange={(e) => setEditWilayahId(e.target.value)}
                  className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
                >
                  <option value="none">-- Pilih Wilayah --</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id.toString()}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editRole !== "super_admin" && editRole !== "admin_pusat" && (
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus Pengguna</ModalHeader>
          <ModalBody>
            <p className="text-default-700 text-sm">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-danger">{selectedDeleteUser?.full_name || selectedDeleteUser?.email}</span>?
            </p>
            <p className="text-xs text-default-500 mt-2">
              Peringatan: Tindakan ini tidak dapat dibatalkan. Semua sesi pemindaian yang dibuat oleh pengguna ini akan ikut terhapus untuk menjaga konsistensi database!
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={deleteModal.onClose}>Batal</Button>
            <Button color="danger" onPress={handleDelete}>Hapus</Button>
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
                {user?.role === "admin_pusat" && <option value="admin_pusat">Admin Pusat</option>}
                {user?.role === "admin_pusat" && <option value="super_admin">Super Admin</option>}
                <option value="admin">Lembaga Admin</option>
                <option value="staff">Lembaga Staff</option>
                <option value="pengguna">Pengguna (Aplikasi)</option>
              </select>
            </div>

            {createRole === "super_admin" && user?.role === "admin_pusat" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-600">Wilayah / Kota</label>
                <select
                  value={createWilayahId}
                  onChange={(e) => setCreateWilayahId(e.target.value)}
                  className="w-full h-12 px-3 py-2 border-2 border-default-200 rounded-xl bg-transparent outline-none focus:border-primary transition-colors text-sm text-default-700 dark:bg-default-100"
                >
                  <option value="none">-- Pilih Wilayah --</option>
                  {wilayahList.map((w) => (
                    <option key={w.id} value={w.id.toString()}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {createRole !== "super_admin" && createRole !== "admin_pusat" && (
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
