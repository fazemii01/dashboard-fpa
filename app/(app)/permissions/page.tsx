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
  Checkbox,
  Spinner,
  Card,
  CardBody
} from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";
import { useToast } from "@/components/toast/toast-provider";

const PERMISSIONS = [
  { key: "CREATE_SESSION", label: "Create Session", desc: "Registrasi peserta baru dan melakukan scan sidik jari." },
  { key: "VIEW_HISTORY", label: "View History", desc: "Melihat riwayat scan, status antrean review, dan unduh laporan PDF." },
  { key: "DELETE_SESSION", label: "Delete Session", desc: "Menghapus sesi scan dan menghapus data sidik jari terkait." },
  { key: "GENERATE_REPORT", label: "Generate Report", desc: "Memproses analisa sidik jari & menghasilkan laporan (memotong 1 kredit)." },
  { key: "MANAGE_USERS", label: "Manage Users", desc: "Menambahkan dan menonaktifkan akun staff di lembaganya sendiri." },
];

export default function PermissionsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [staffPermissions, setStaffPermissions] = useState<string[]>([]);

  useEffect(() => {
    apiRequest("/super-admin/permissions")
      .then((data) => {
        setAdminPermissions(data.admin || []);
        setStaffPermissions(data.staff || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (role: "admin" | "staff", permKey: string, isChecked: boolean) => {
    if (role === "admin") {
      if (isChecked) {
        setAdminPermissions((prev) => [...prev, permKey]);
      } else {
        setAdminPermissions((prev) => prev.filter((p) => p !== permKey));
      }
    } else {
      if (isChecked) {
        setStaffPermissions((prev) => [...prev, permKey]);
      } else {
        setStaffPermissions((prev) => prev.filter((p) => p !== permKey));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest("/super-admin/permissions", {
        method: "POST",
        body: JSON.stringify([
          { role: "admin", permissions: adminPermissions },
          { role: "staff", permissions: staffPermissions },
        ]),
      });
      toast.success("Pengaturan perizinan berhasil disimpan.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pengaturan perizinan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-default-900">Hak Akses & Perizinan</h3>
          <p className="text-default-500 text-sm">Konfigurasi matriks perizinan bagi peran Lembaga Admin dan Lembaga Staff secara dinamis.</p>
        </div>
        <Button color="primary" onPress={handleSave} isLoading={saving}>
          Simpan Pengaturan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" label="Memuat hak akses..." />
        </div>
      ) : (
        <Card className="bg-default-50 shadow-md">
          <CardBody className="p-0">
            <Table aria-label="Permissions matrix table" removeWrapper>
              <TableHeader>
                <TableColumn width="40%">NAMA HAK AKSES</TableColumn>
                <TableColumn width="30%">LEMBAGA ADMIN</TableColumn>
                <TableColumn width="30%">LEMBAGA STAFF</TableColumn>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map((perm) => (
                  <TableRow key={perm.key}>
                    <TableCell>
                      <div className="flex flex-col gap-1 py-2">
                        <span className="font-semibold text-default-900 text-sm">{perm.label}</span>
                        <span className="text-xs text-default-500">{perm.desc}</span>
                        <span className="text-[10px] text-primary font-mono">{perm.key}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        isSelected={adminPermissions.includes(perm.key)}
                        onValueChange={(checked) => handleCheckboxChange("admin", perm.key, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        isSelected={staffPermissions.includes(perm.key)}
                        onValueChange={(checked) => handleCheckboxChange("staff", perm.key, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
