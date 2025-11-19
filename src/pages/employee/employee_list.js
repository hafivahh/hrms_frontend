import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { employee } from '@/data/sidebar/employee'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Table } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons-react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

Employee_list.title = "Employee List"
export default function Employee_list() {
  const router = useRouter()
  const { user } = useUser()

  console.log(user)
  const API = useApi()
  const API_URL = API.API_URL

  const [loadingData, setLoadingData] = useState(true)
  const [loadingOpt, setLoadingOpt] = useState(false)
  const [display, setDisplay] = useState(false)


  const [data, setData] = useState([])
  const [savedFilter, setSavedFilter] = useState({})
  const [checkedId, setCheckedId] = useState([])
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useDebouncedState([], 500);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

 const columns = useMemo(() => [
  {
    accessorKey: "badge_number",
    id: "badge",
    header: "Badge",
  },
  {
    accessorKey: "full_name",
    id: "name",
    header: "Name",
  },
  {
    accessorKey: "id_departement",
    id: "departemen",
    header: "Departemen",
  },
  {
    accessorKey: "id_project",
    id: "project",
    header: "Project",
  },
  {
    accessorKey: "id",
    id: "id",
    header: "Action",
    cell: (info) => {
      const id = info.getValue();
      return (
        <Button onClick={() => router.push('/employee/edit_employee/' + id)} leftSection={<IconEdit />} color='orange'>
          Edit
        </Button>
      );
    }
  }
], []);

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  const downloadPdf  = async() => {
    try {
      const response = await axios.get(API_URL + '/api/testing/generate_pdf', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "PDF Sample.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  const downloadExcel = async () => {
    try {
      const response = await axios.get(API_URL + '/api/testing/download', {
        responseType: "blob",
        headers : {
          Authorization : "Bearer "+user.token
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "LargeData.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  // useEffect(() => {

  //   // const getData = async () => {
  //   //   const filterParams = columnFilters
  //   //     .map((filter) => filter.value != null ? `${filter.id}=${filter.value}` : "")
  //   //     .join("&");

  //   //   const sort =
  //   //     sorting && sorting.length > 0
  //   //       ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
  //   //       : "";

  //   //   const { data } = await axios.post(
  //   //     `${API_URL}/api/testing/serverside_employee_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
  //   //     savedFilter,
  //   //     {
  //   //       headers: {
  //   //         "Content-Type": "application/json",
  //   //         Authorization: `Bearer ${user.token}`,
  //   //       },
  //   //     }
  //   //   );


  //   //   setData(data.content);
  //   //   setTotalPages(data.totalPages);
  //   //   if (loadingData) {
  //   //     setLoadingData(false)
  //   //   }
  //   //   setLoadingOpt(false)
  //   // };


  //   // getData();
  // }, [
  //   user.token,
  //   columnFilters,
  //   pagination.pageIndex,
  //   pagination.pageSize,
  //   sorting,
  //   loadingData,
  //   savedFilter,
  //   API_URL

  // ]);
useEffect(() => {
  const getData = async () => {
    try {

      const response = await axios.get(`${API_URL}/api/employee/test`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log("API Response:", response.data);
      setData(response.data);
      setTotalPages(1);
      setLoadingData(false);

    } catch (err) {
      console.error("API ERROR:", err);
    }
  };

  getData();
}, [API_URL, user.token]);


  return (
    <AuthLayout sidebarList={employee}>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="px-4 py-2 text-right space-x-2">
              <Button onClick={() => router.push("/employee/add_employee")}> Add Employee</Button>
              <Button onClick={downloadExcel}> Download Excel</Button>
              <Button onClick={downloadPdf}> Download PDF</Button>
              <Button onClick={() => router.push("/employee/upload_sftp")}> Upload SFTP</Button>
            </div>
            {
              <>
              {data.map((row) => (
                <div key={row.id}>
                  <p>{row.full_name} - {row.badge_number}</p>
                </div>
              ))}
              {/* <p className="p-4"> Total Data : {data.length} </p> */}

              <p className="p-4"> Total Data : {data.length} </p>
              </>
            }
            {/* <div className="p-4 overflow-x-auto">
              {
                <Datatables table={table} totalPages={totalPages} />
              }
            </div> */}
          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}
