import cron from 'node-cron'
import {runBorrowCheckerJob} from './borrow-checker'

// Chạy cron job mỗi ngày 7h sáng
cron.schedule('0 7 * * *', async () => {
    console.log('🕗 Bắt đầu chạy job kiểm tra yêu cầu mượn...')
    try {
        await runBorrowCheckerJob()
    } catch (error) {
        console.error('Lỗi chạy job borrow-checker:', error)
    }
})
