export default function Placeholder({ title }) {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>This page is under development.</p>
          </div>
        </div>
      </div>
    </div>
  )
}