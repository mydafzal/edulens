
import { MoveUpRight } from 'lucide-react'


export default function EmailSuccess() {


    return (
        <div className='w-full min-h-full  flex items-center justify-center bg-[#F6F6F6]'>
            <div className='w-[396px] h-[60px] mt-[-150px] flex flex-col gap-11'>
                <div className=' '>
                    <h1 className='text-[40px] font-bold text-center'>Email Verification
                        Successful 🚀</h1>
                </div>

                <div className='w-full flex items-center justify-center'>
                    <button type='submit' className='bg-black pl-[25px] py-[5px] pr-1.5  w-[162px] h-[60px] flex items-center justify-between rounded-full text-white cursor-pointer'>
                        <span className='text-lg font-[500px]'>Continue
                        </span>
                        <button className='w-[50px] text-black bg-white h-[50px] rounded-full flex items-center justify-center'>
                            <MoveUpRight />
                        </button>
                    </button>
                </div>


            </div >
        </div >
    )
}
