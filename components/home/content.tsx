"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner } from "@nextui-org/react";
import { apiRequest } from "@/helpers/api";

export const Content = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/super-admin/dashboard-stats")
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <Spinner size="lg" label="Memuat data statistik..." />
      </div>
    );
  }

  const {
    total_lembaga = 0,
    total_credits = 0,
    total_users = 0,
    total_scans = 0,
    total_reports = 0,
    recent_sessions = [],
    credit_summary = []
  } = stats || {};

  return (
    <div className="h-full lg:px-6 py-6 max-w-[90rem] mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-default-900">Dashboard Overview v.1</h3>
        <p className="text-default-500 text-sm">Overview metrics and statistics for Allia Tab Finger.</p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
          <CardBody className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium opacity-80">Total Lembaga</span>
            <span className="text-3xl font-bold">{total_lembaga}</span>
            <span className="text-xs opacity-60">Registered Institutions</span>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg">
          <CardBody className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium opacity-80">Total Users</span>
            <span className="text-3xl font-bold">{total_users}</span>
            <span className="text-xs opacity-60">Staff and Admins</span>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-success-600 text-white shadow-lg">
          <CardBody className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium opacity-80">Total Credit Balance</span>
            <span className="text-3xl font-bold">{total_credits}</span>
            <span className="text-xs opacity-60">Allocated Credits Pool</span>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-warning-500 to-warning-600 text-white shadow-lg">
          <CardBody className="flex flex-col gap-1 p-6">
            <span className="text-sm font-medium opacity-80">Reports Generated</span>
            <span className="text-3xl font-bold">{total_reports}</span>
            <span className="text-xs opacity-60">From {total_scans} Scan Sessions</span>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sessions list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-lg font-bold text-default-900">Recent Scanning Sessions</h3>
          <Card className="bg-default-50 shadow-md">
            <CardBody className="p-0">
              <Table aria-label="Recent scan sessions table" removeWrapper>
                <TableHeader>
                  <TableColumn>PARTICIPANT</TableColumn>
                  <TableColumn>INSTITUTION</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>CREATED AT</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No scanning sessions found">
                  {recent_sessions.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-semibold">{session.participant_name}</TableCell>
                      <TableCell>{session.lembaga_name}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            session.status === "report_generated"
                              ? "success"
                              : session.status === "waiting_for_review"
                              ? "warning"
                              : session.status === "rejected"
                              ? "danger"
                              : "primary"
                          }
                          variant="flat"
                          size="sm"
                        >
                          {session.status.toUpperCase().replace(/_/g, " ")}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-default-500 text-xs">
                        {new Date(session.created_at).toLocaleDateString("id-ID", {
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
            </CardBody>
          </Card>
        </div>

        {/* Credit pool ranking */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-default-900">Credit Allocations</h3>
          <Card className="bg-default-50 shadow-md">
            <CardBody className="flex flex-col gap-4 p-5">
              {credit_summary.length === 0 ? (
                <p className="text-default-400 text-center text-sm">No institutions found</p>
              ) : (
                credit_summary.map((item: any, idx: number) => (
                  <div key={item.name} className="flex justify-between items-center border-b border-divider pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-semibold text-default-900 text-sm">{item.name}</span>
                      <span className="text-xs text-default-400">Rank #{idx + 1}</span>
                    </div>
                    <Chip color={item.credits < 10 ? "danger" : "success"} variant="solid" size="md">
                      {item.credits} Credits
                    </Chip>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
