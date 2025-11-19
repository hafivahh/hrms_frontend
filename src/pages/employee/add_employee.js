import AuthLayout from '@/components/layout/authLayout'
import useApi from '@/hooks/useApi'
import useSwal from '@/hooks/useSwal'
import useUser from '@/store/useUser'
import { Button, Paper, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import axios from 'axios'
import { useRouter } from 'next/router'
import React from 'react'
import { useState } from 'react'
import { master_data } from "@/data/sidebar/master_data";

Add_employee.title = "Add Employee"
export default function Add_employee() {

  const router      = useRouter()
  const { user }    = useUser()
  const API         = useApi()
  const API_URL     = API.API_URL
  const {showAlert} = useSwal()
  // const [formData, setFormData] = useState({
  //   nama            : '',
  //   nomor_karyawan  : ''
  // })

  const form = useForm({
    initialValues: {
      nama: '',
      nomor_karyawan: ''
    },
    validate: {
      nama: (value) => (value.trim().length > 0 ? null : 'Employee Name is Required'),
      nomor_karyawan: (value) => (value.trim().length > 0 ? null : 'Employee Badge No is Required'),
    }
  })

  const handleSubmit = async (values) => {
    try {
      
      const {data} = await axios.post(`${API_URL}/api/testing/create_employee`, values, {
        headers: {
          Authorization : "Bearer "+user.token
        }
      })

      if(data.success) {
        showAlert("Success", "success", data.message)
        form.reset()
        router.push("/employee/employee_list")
      }

    } catch (error) {
      const data_error = error.response.data
      showAlert(data_error.message, "error", data_error.error)
    }
  }

  return (
    <AuthLayout sidebarList={master_data}>
      <div className='py-6'>
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
            <div className="bg-gray-200 px-4 py-2">
              <Text fw={500}>Add Employee</Text>
            </div>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className='px-4 py-2'>
                <TextInput
                  label="Employee Name"
                  withAsterisk
                  placeholder='Input Employee Name'
                  {...form.getInputProps('nama')}
                   />
                
              </div>

              <div className='px-4 py-2'>
                <TextInput
                  label="Employee Badge"
                  withAsterisk
                  placeholder='Input Employee Badge No.'
                  {...form.getInputProps('nomor_karyawan')}
                  />
              </div>

              <div className='px-4 py-2 text-right'>
                <Button type='submit'> Submit</Button>
              </div>
            </form>

          </Paper>
        </div>
      </div>
    </AuthLayout>
  )
}
