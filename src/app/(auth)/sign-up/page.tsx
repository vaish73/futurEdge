'use client'

import { signUpSchema } from '@/schemas/signUpSchema';
import React from 'react'
import { useForm }from "react-hook-form"
import * as z  from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function SignUp() {
    const router = useRouter()
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        try {
            const response = await axios.post('/api/sign-up', data)

            console.log(response);
            router.push("/dashboard")
        } catch (error) {
            console.error('Error during Sign Up, Try Again', error);
        }
    }

  return (
    <div className="flex text-sm justify-center items-center min-h-screen">
      <div className="w-1/3 max-w-md p-8 space-y-3 bg-black rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Sign Up
          </h1>
          <p className="mb-4 text-sm">Sign up to start your future adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                  />
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" onClick={() => onSubmit} className='w-full'>
              SignUp
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp