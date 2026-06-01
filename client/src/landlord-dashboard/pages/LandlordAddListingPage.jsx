import { ChevronDown, ImagePlus, ImageUp, Plus } from 'lucide-react'
import LandlordSectionCard from '../components/LandlordSectionCard'
import { listingAmenities } from '../data'

const thumbnailPlaceholders = [1, 2, 3, 4]

function LandlordAddListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#111827]">
          Add New Listing
        </h1>
        <p className="mt-1 text-[14px] text-[#64748b]">
          Fill in the details below to add your property.
        </p>
      </div>

      <LandlordSectionCard className="p-6">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">
                Property Name
              </span>
              <input className="field h-12 rounded-[12px]" placeholder="Enter property name" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">
                Location
              </span>
              <input className="field h-12 rounded-[12px]" placeholder="Enter location" />
            </label>

            <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">Price</span>
                <div className="flex items-center rounded-[12px] border border-slate-200 bg-white px-4">
                  <span className="text-[13px] font-medium text-[#64748b]">$</span>
                  <input
                    className="field h-12 border-0 px-3 shadow-none focus:ring-0"
                    placeholder="Enter price"
                  />
                  <span className="whitespace-nowrap text-[12px] text-[#64748b]">/ month</span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">
                  Property Type
                </span>
                <div className="relative">
                  <select className="field h-12 appearance-none rounded-[12px] pr-10 text-[#64748b]">
                    <option>Select property type</option>
                    <option>Apartment</option>
                    <option>Studio</option>
                    <option>Villa</option>
                    <option>Cabin</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    size={16}
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">
                Description
              </span>
              <textarea
                className="field min-h-[144px] rounded-[12px] py-3"
                placeholder="Write description about your property..."
              />
            </label>
          </div>

          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-[12px] font-semibold text-[#1e293b]">
                Upload Images
              </span>
              <div className="ld-upload-dashed rounded-[18px] border border-dashed border-[#86cf96] px-6 py-8 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#86cf96] bg-white text-[#23933d]">
                  <Plus size={24} />
                </div>
                <p className="mt-4 text-[14px] font-semibold text-[#111827]">Upload photos</p>
                <p className="mt-1 text-[12px] text-[#64748b]">
                  Drag and drop or click to upload
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {thumbnailPlaceholders.map((item) => (
                <div
                  className="grid h-[84px] place-items-center rounded-[14px] border border-[#e8edf1] bg-[#f8fafc] text-[#cbd5e1]"
                  key={item}
                >
                  <ImageUp size={28} />
                </div>
              ))}
            </div>

            <div>
              <span className="mb-3 block text-[12px] font-semibold text-[#1e293b]">
                Amenities
              </span>
              <div className="grid gap-y-3 sm:grid-cols-2">
                {listingAmenities.map((amenity) => (
                  <label className="flex items-center gap-2.5 text-[13px] text-[#475569]" key={amenity}>
                    <input className="h-4 w-4 rounded border-slate-300 text-[#23933d]" type="checkbox" />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#edf2f7] pt-5 sm:flex-row sm:justify-end">
          <button
            className="inline-flex items-center justify-center rounded-[12px] border border-[#b8e6be] px-5 py-3 text-[13px] font-semibold text-[#23933d]"
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#23933d] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(36,150,63,0.25)] transition hover:bg-[#1f7f36]"
            type="button"
          >
            <ImagePlus size={16} />
            Submit Listing
          </button>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordAddListingPage
