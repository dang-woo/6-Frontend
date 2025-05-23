"use client"

import * as React from 'react'
import { MainSearchForm } from '@/components/search/MainSearchForm'

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-start flex-grow h-full pt-16 md:pt-24">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-primary sm:text-7xl lg:text-8xl">
          RPGPT
        </h1>
      </div>

      <MainSearchForm />
    </div>
  )
}
