import Layout from '@/layout'

import TestPageComponent from './test_page_component';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Test your level of English",
};

export default function Test() {
  return (
    <Layout>
      <h1>{metadata.title as string}</h1>
      <TestPageComponent />
    </Layout>
  );
}