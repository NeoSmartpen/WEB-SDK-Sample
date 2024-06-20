declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';

declare module "*.nproj" {
  const nproj: string; // Change this to an actual XML type
  export default nproj;
}
