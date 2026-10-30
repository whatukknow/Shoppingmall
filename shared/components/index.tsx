// UI 프리미티브와 화면 공통 컴포넌트를 단일 import 경로로 노출합니다.
export { Badge } from './ui/badge';
export { Button } from './ui/button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './ui/card';

export { Input } from './ui/input';

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export { MastHead } from './MastHead';
export { BrandLogo } from './BrandLogo';
export {
  ButterBackground,
  type ButterBackgroundProps,
} from './ButterBackground';
export { MainNavigation } from './MainNavigation';
export { default as Footer } from './Footer';
export type { BrandInformationProps, FooterComponentProps } from './Footer';
export { ProductCard } from './ProductCard';
export { default as ProductGrid } from './ProductGrid';
export { CarouselContainer } from './CarouselContainer';

export { FormField, type FormFieldProps } from './FormField';
export { StatusBadge, type ApplicationStatus } from './StatusBadge';
export { PotCard, type PotCardProps } from './PotCard';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export {
  ActionDialog,
  CancellationDialog,
  NotificationDialog,
  type ActionDialogProps,
  type CancellationDialogProps,
  type NotificationDialogProps,
} from './ActionDialog';
export { NavigationAction, type NavigationTarget } from './NavigationAction';
export type { MastHeadProps } from './MastHead';
export type { MainNavigationProps } from './MainNavigation';
