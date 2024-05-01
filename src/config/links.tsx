import { LinkType } from '@/types/link';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiTag } from 'react-icons/fi';

export const links: LinkType[] = [
  { name: 'tags', href: '/tags', icon: <FiTag /> },
  { name: 'about', href: '/about', icon: <AiOutlineInfoCircle /> },
  { name: '今日の一問', href: '/tags/今日の一問', icon: <AiOutlineInfoCircle /> },
];
