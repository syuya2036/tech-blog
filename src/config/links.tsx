import { LinkType } from '@/types/link';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiTag } from 'react-icons/fi';

export const links: LinkType[] = [
  { name: 'tags', href: '/tags', icon: <FiTag /> },
  { name: 'about', href: '/about', icon: <AiOutlineInfoCircle /> },
];
