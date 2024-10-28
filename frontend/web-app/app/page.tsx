import Listings from './jobposts/Listings';

export default async function Home() {
  return (
    <div>
      <h3 className="text-3xl font-semibold">
        <Listings />
        </h3>
    </div>
  );
}
