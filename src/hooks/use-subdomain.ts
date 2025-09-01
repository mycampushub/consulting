"use client"

import { useParams } from "next/navigation"

export function useSubdomain() {
  const params = useParams()
  return params.subdomain as string
}