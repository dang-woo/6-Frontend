"use client"

import * as React from 'react'
import { MainSearchForm } from '@/components/search/MainSearchForm'
import { PageTitle } from '@/components/layout/PageTitle'

export default function MainPage() {
  return (
    <div className="flex flex-col items-center justify-start flex-grow h-full pt-16 md:pt-24">
      <PageTitle title="RPGPT" />
      <MainSearchForm />
    </div>
  )
}
