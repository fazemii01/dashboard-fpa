"use client";

import { useState } from "react";
import { createAuthCookie } from "@/actions/auth.action";
import { LoginSchema } from "@/helpers/schemas";
import { LoginFormType } from "@/helpers/types";
import { Button, Input } from "@nextui-org/react";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialValues: LoginFormType = {
    email: "",
    password: "",
  };

  const handleLogin = useCallback(
    async (values: LoginFormType) => {
      setError(null);
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Email atau password salah.");
        }

        const data = await response.json();
        
        if (data.role !== "super_admin") {
          throw new Error("Akses Ditolak: Hanya Super Admin yang dapat mengakses dashboard ini.");
        }

        await createAuthCookie(data.access_token);
        router.replace("/");
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="w-full max-w-[420px] p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-6 text-white">
      <div className="flex flex-col gap-2">
        <h2 className='text-2xl font-bold text-white tracking-tight'>Masuk Dashboard</h2>
        <p className="text-slate-400 text-sm">Silakan masukkan akun Super Admin Anda untuk melanjutkan.</p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}>
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <>
            {error && (
              <div className="text-danger text-xs font-semibold p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-center">
                {error}
              </div>
            )}
            
            <div className='flex flex-col gap-4'>
              <Input
                variant='bordered'
                label='Alamat Email'
                placeholder='admin@alliakids.com'
                type='email'
                classNames={{
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-primary rounded-xl",
                  label: "text-slate-400",
                  input: "text-white"
                }}
                value={values.email}
                isInvalid={!!errors.email && !!touched.email}
                errorMessage={errors.email}
                onChange={handleChange("email")}
              />
              
              <Input
                variant='bordered'
                label='Kata Sandi'
                placeholder='••••••••'
                type='password'
                classNames={{
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-primary rounded-xl",
                  label: "text-slate-400",
                  input: "text-white"
                }}
                value={values.password}
                isInvalid={!!errors.password && !!touched.password}
                errorMessage={errors.password}
                onChange={handleChange("password")}
              />
            </div>

            <Button
              onPress={() => handleSubmit()}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold rounded-xl mt-2 transition-all shadow-lg shadow-primary/20"
              isLoading={loading}
              isDisabled={loading}>
              Masuk Sekarang
            </Button>
          </>
        )}
      </Formik>
    </div>
  );
};
