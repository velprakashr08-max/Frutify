import {Carrot,Leaf,TreeDeciduous,Apple,Shrub,Bean} from 'lucide-react';
import {cn} from '@/lib/utils';

const iconMap = {
  carrot:Carrot,
  leaf:Leaf,
  tree:TreeDeciduous,
  apple:Apple,
  shrub:Shrub,
  bean:Bean,
};

export default function CategoryIcon({name,className}) {
  const Icon=iconMap[name]||Leaf;
  return <Icon className={cn('h-5 w-5',className)} />;
}

export {iconMap};