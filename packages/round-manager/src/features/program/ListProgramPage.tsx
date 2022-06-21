import { Link } from "react-router-dom"

import { useWeb3 } from "../common/ProtectedRoute"
import { useListProgramsQuery } from "../api/services/program"
import {
  ArrowNarrowRightIcon,
  PlusSmIcon,
  UserIcon,
} from "@heroicons/react/solid"
import { Spinner } from "../common/Spinner"


function ListPrograms() {
  const { account } = useWeb3()
  const { data: programs, isLoading, isSuccess } = useListProgramsQuery(account)

  const programList = programs?.map((program, index) => (
    <div
      key={program.id}
      className="relative rounded-sm border border-gray-300 bg-white px-6 py-4 my-4 shadow-lg drop-shadow-sm flex items-center space-x-3"
    >

      <div className="flex-1 min-w-0">

        <p className="text-sm mb-1 font-medium text-gray-900">
          {program.metadata!.name}
        </p>

        <p className="text-xs text-grey-400 flex gap-1">
          <UserIcon className="h-4 w-4 text-black"/>
          <span>{program.operatorWallets.length}</span>
          <span>Round Operators</span>
        </p>
      </div>

      <Link className="text-sm flex gap-2" to={`/program/${program.id}`} key={index}>
        <span>View Details</span>
        <ArrowNarrowRightIcon className="h-5 w-5"/>
      </Link>

    </div>
  ));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
       <h1 className="text-[32px] text-grey-500">My Programs</h1>
       <h2 className="text-base text-grey-400">
         Create grant program and manage rounds with independent criteria.
        </h2>
      </header>
      <main>
        <div className="grid">
          <div className="w-100 md:w-3/4">
            {programList}
          </div>
        </div>

        {isSuccess &&
          <Link to="/program/create">
            <button
              type="button"
              className="inline-flex items-center px-2.5 py-1.5 border border-white shadow-sm text-xs font-medium rounded text-grey-500 bg-white hover:bg-gray-50"
            >
              <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true"/>
               Create Program
            </button>
          </Link>
        }

        {isLoading &&
          <Spinner text="Fetching Programs" />
        }
      </main>
    </div>
  )
}

export default ListPrograms;