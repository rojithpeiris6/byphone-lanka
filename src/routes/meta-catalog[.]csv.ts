import { createFileRoute } from '@tanstack/react-router';
import { catalogResponse } from '@/lib/tracking/catalog.server';
export const Route = createFileRoute('/meta-catalog.csv')({server:{handlers:{GET:()=>catalogResponse('csv')}}});
