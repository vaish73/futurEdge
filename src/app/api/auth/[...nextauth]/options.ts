import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import  CredentialsProvider  from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import bcrypt from 'bcryptjs'
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
            authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code"
                }
              }
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })
                    console.log(credentials.identifier);
                    
                    if(!user){
                        throw new Error("No user found with this email or username");
                    }
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password   
                    )
                    if (!isPasswordCorrect) throw new Error("Incorrect password");

                    return user;
                } catch (error: any) {
                    throw new Error(error.message)
                }
            }
        })
    ],
    callbacks: {
        async jwt({token, user}) {
            if(user) {
                token._id = user._id?.toString();
                token.username = user.username;
            }
            return token
        },
        async session({session, token}) {
            if(token){
                session.user = session.user || {};
                session.user._id = token._id;
                session.user.username = token.username
            }
            return session;
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in"
    }
    
}