import { createFileRoute } from '@tanstack/react-router';
import { catalogResponse } from '@/lib/tracking/catalog.server';
export const Route = createFileRoute('/meta-catalog.xml')({server:{handlers:{GET:()=>catalogResponse('xml')}}});
