import Image from 'next/image';

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/letsfit-logo.png"
      alt="LetsFit logo"
      width={size}
      height={size}
      style={{ display: 'block' }}
      priority
    />
  );
}
