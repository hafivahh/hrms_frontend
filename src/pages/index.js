import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Paper, Text, Grid } from "@mantine/core";
import {
  IconCircleCheckFilled,
  IconArrowRight,
  IconFolderOpen,
  IconHourglass,
  IconX,
  IconCheck,
  IconBellFilled,
  IconListCheck,
  IconSquareCheckFilled,
} from "@tabler/icons-react";

export default function Index() {
  return (
    <AuthLayout>
      <Head>
        <title>Home</title>
      </Head>

      <div className="py-12">
        <div className="max-w mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-lg border sm:rounded-lg">
            <div className="p-6 text-gray-900 justify-center text-center font-bold">
              Human Resources Management System
            </div>
          </div>
        </div>
      </div>

      {}
    </AuthLayout>
  );
}
